/// Auction Details Screen for Flutter Customer App
/// Requirements: 3.2, 4.1 - Display car details, current price, bid form, bids list
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:video_player/video_player.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_strings.dart';
import 'package:customer_app/core/utils/formatters.dart';
import 'package:customer_app/core/api/api_endpoints.dart';
import 'package:customer_app/models/auction.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/models/inspection.dart';
import 'package:customer_app/providers/auction_provider.dart';
import 'package:customer_app/providers/settings_provider.dart';
import 'package:customer_app/widgets/countdown_timer.dart';
import 'package:customer_app/widgets/bid_form.dart';
import 'package:customer_app/widgets/bids_list.dart';
import 'package:customer_app/widgets/error_widget.dart';
import 'package:customer_app/widgets/image_gallery.dart';
import 'package:customer_app/screens/inspection/inspection_view_screen.dart';
import 'package:customer_app/constants/inspection_constants.dart';

/// Auction Details Screen - شاشة تفاصيل المزاد
/// Requirements: 3.2, 4.1
class AuctionDetailsScreen extends ConsumerStatefulWidget {
  /// Auction ID to display
  final int auctionId;

  /// Optional pre-loaded auction data
  final Auction? initialAuction;

  const AuctionDetailsScreen({
    super.key,
    required this.auctionId,
    this.initialAuction,
  });

  @override
  ConsumerState<AuctionDetailsScreen> createState() => _AuctionDetailsScreenState();
}

class _AuctionDetailsScreenState extends ConsumerState<AuctionDetailsScreen> {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final auctionAsync = ref.watch(auctionDetailsProvider(widget.auctionId));

    return Scaffold(
      backgroundColor: isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      body: auctionAsync.when(
        data: (auction) => _buildContent(auction, isDark),
        loading: () => const _AuctionDetailsShimmer(),
        error: (error, stack) => AppErrorWidget(
          message: error.toString(),
          onRetry: _refreshData,
        ),
      ),
    );
  }

  Widget _buildContent(Auction auction, bool isDark) {
    return CustomScrollView(
      slivers: [
        // App bar with image gallery
        _buildSliverAppBar(auction, isDark),
        // Auction details content
        SliverToBoxAdapter(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Car info header
              _buildCarHeader(auction, isDark),
              // Countdown timer
              _buildCountdownSection(auction, isDark),
              // Price section
              _buildPriceSection(auction, isDark),
              // Contact buttons (WhatsApp & Call)
              _buildContactButtons(auction, isDark),
              // Bid form
              _buildBidFormSection(auction, isDark),
              // Inspection section (for used cars with inspection data)
              if (auction.car != null && 
                  auction.car!.condition == CarCondition.used && 
                  auction.car!.inspection != null)
                _buildInspectionSection(auction.car!.inspection!, auction.car!, isDark),
              // Bids list
              _buildBidsSection(auction, isDark),
              // Video section (if available)
              if (auction.car?.video != null) _buildVideoSection(auction.car!.video!, isDark),
              // Car specifications (if available)
              if (auction.car != null) _buildCarSpecsSection(auction, isDark),
              // Bottom padding
              const SizedBox(height: 32),
            ],
          ),
        ),
      ],
    );
  }

  /// Sliver app bar with image gallery
  Widget _buildSliverAppBar(Auction auction, bool isDark) {
    final car = auction.car;
    
    return SliverAppBar(
      expandedHeight: 300,
      pinned: true,
      backgroundColor: isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      foregroundColor: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
      actions: [
        // Share button
        IconButton(
          icon: const Icon(Icons.share, color: Color(0xFF25D366)),
          onPressed: () => _shareAuction(auction),
          tooltip: 'مشاركة',
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: car != null && car.images.isNotEmpty
            ? ImageGallery(
                images: car.images,
                thumbnailUrl: car.thumbnail,
                height: 300,
                showIndicator: true,
                enableZoom: true,
              )
            : _buildPlaceholderImage(isDark),
      ),
    );
  }

  Widget _buildPlaceholderImage(bool isDark) {
    return Container(
      color: isDark ? AppColors.surfaceDark : AppColors.shimmerBase,
      child: Center(
        child: Icon(
          Icons.directions_car,
          size: 64,
          color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
        ),
      ),
    );
  }

  /// Car header with name, brand, model
  Widget _buildCarHeader(Auction auction, bool isDark) {
    final car = auction.car;

    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Badges row
          Row(
            children: [
              // Auction badge
              _buildBadge(
                AppStrings.auction,
                AppColors.accent,
                icon: Icons.gavel,
              ),
              const SizedBox(width: 8),
              // Status badge
              _buildStatusBadge(auction),
            ],
          ),
          const SizedBox(height: 12),
          // Car name
          Text(
            car?.name ?? 'سيارة',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
          ),
          if (car != null) ...[
            const SizedBox(height: 4),
            // Brand and model
            Text(
              '${car.brand} ${car.model} - ${car.year}',
              style: TextStyle(
                fontSize: 16,
                color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBadge(String text, Color color, {IconData? icon}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: Colors.white),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(Auction auction) {
    if (auction.hasEnded) {
      return _buildBadge(AppStrings.auctionEnded, AppColors.soldBadge);
    }
    return _buildBadge('نشط', AppColors.success);
  }

  /// Countdown timer section
  Widget _buildCountdownSection(Auction auction, bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: CountdownTimer(
        endTime: auction.endTime,
        compact: false,
        onEnd: () {
          // Refresh data when auction ends
          _refreshData();
        },
      ),
    );
  }

  /// Price section
  Widget _buildPriceSection(Auction auction, bool isDark) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          // Current price
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                AppStrings.currentPrice,
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
              Text(
                Formatters.formatCurrency(auction.currentPrice),
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Divider(color: AppColors.primary.withValues(alpha: 0.2)),
          const SizedBox(height: 12),
          // Starting price and bid count
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    AppStrings.startingPrice,
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
                    ),
                  ),
                  Text(
                    Formatters.formatCurrency(auction.startingPrice),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    ),
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'عدد العروض',
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
                    ),
                  ),
                  Text(
                    '${auction.bidCount}',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Bid form section
  Widget _buildBidFormSection(Auction auction, bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: BidForm(
        auction: auction,
        onBidPlaced: _refreshData,
      ),
    );
  }

  /// Bids list section
  Widget _buildBidsSection(Auction auction, bool isDark) {
    return Container(
      margin: const EdgeInsets.all(16),
      child: BidsList(
        bids: auction.bids,
        showHeader: true,
      ),
    );
  }

  /// Inspection section for used cars
  Widget _buildInspectionSection(CarInspection inspection, Car car, bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.fact_check_outlined,
                size: 20,
                color: AppColors.primary,
              ),
              const SizedBox(width: 8),
              Text(
                'تقرير الفحص',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _AuctionInspectionViewer(inspection: inspection, car: car, isDark: isDark),
        ],
      ),
    );
  }

  /// Car specifications section
  Widget _buildCarSpecsSection(Auction auction, bool isDark) {
    final car = auction.car!;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline,
                color: AppColors.primary,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'معلومات السيارة',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _buildSpecRow(AppStrings.brand, car.brand, isDark),
          _buildDivider(isDark),
          _buildSpecRow(AppStrings.model, car.model, isDark),
          _buildDivider(isDark),
          _buildSpecRow(AppStrings.year, car.year.toString(), isDark),
          _buildDivider(isDark),
          _buildSpecRow(
            AppStrings.condition,
            car.condition.name == 'newCar' ? AppStrings.newCar : AppStrings.usedCar,
            isDark,
          ),
          if (car.kilometers != null) ...[
            _buildDivider(isDark),
            _buildSpecRow(
              AppStrings.kilometers,
              Formatters.formatKilometers(car.kilometers!),
              isDark,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSpecRow(String label, String value, bool isDark) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDivider(bool isDark) {
    return Divider(
      color: isDark ? AppColors.borderDark : AppColors.borderLight,
      height: 1,
    );
  }

  /// Video section
  Widget _buildVideoSection(CarVideo video, bool isDark) {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.play_circle_outline,
                color: AppColors.primary,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'فيديو السيارة',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: video.type == CarVideoType.youtube
                ? _YouTubeVideoPlayer(videoUrl: video.url)
                : _UploadedVideoPlayer(videoUrl: video.url),
          ),
        ],
      ),
    );
  }

  /// Contact buttons section (WhatsApp & Call)
  Widget _buildContactButtons(Auction auction, bool isDark) {
    final settings = ref.watch(settingsProvider);
    
    return settings.when(
      data: (settingsData) {
        final phone = settingsData?.phone ?? '';
        final whatsapp = settingsData?.whatsapp ?? phone;
        
        if (phone.isEmpty && whatsapp.isEmpty) {
          return const SizedBox.shrink();
        }
        
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              // WhatsApp button
              if (whatsapp.isNotEmpty)
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _openWhatsApp(auction, whatsapp),
                    icon: const Icon(Icons.chat, size: 20),
                    label: const Text('واتساب'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF25D366),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
              if (whatsapp.isNotEmpty && phone.isNotEmpty)
                const SizedBox(width: 12),
              // Call button
              if (phone.isNotEmpty)
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _makePhoneCall(phone),
                    icon: const Icon(Icons.phone, size: 20),
                    label: const Text('اتصال'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        );
      },
      loading: () => const SizedBox.shrink(),
      error: (_, __) => const SizedBox.shrink(),
    );
  }

  /// Share auction
  Future<void> _shareAuction(Auction auction) async {
    final car = auction.car;
    final carName = car?.name ?? 'سيارة';
    final price = Formatters.formatCurrency(auction.currentPrice);
    
    final message = '''
🚗 مزاد: $carName

💰 السعر الحالي: $price
📊 عدد العروض: ${auction.bidCount}

🏪 معرض وحدة اليمن للسيارات
''';
    
    await Share.share(message, subject: 'مزاد: $carName');
  }

  /// Open WhatsApp with pre-filled message
  Future<void> _openWhatsApp(Auction auction, String whatsapp) async {
    final car = auction.car;
    final carName = car?.name ?? 'سيارة';
    final price = Formatters.formatCurrency(auction.currentPrice);
    
    final message = Uri.encodeComponent(
      'مرحباً، أنا مهتم بالمزاد:\n'
      '🚗 $carName\n'
      '💰 السعر الحالي: $price'
    );
    
    // Clean phone number
    final cleanPhone = whatsapp.replaceAll(RegExp(r'[^\d+]'), '');
    final phoneNumber = cleanPhone.startsWith('+') ? cleanPhone.substring(1) : cleanPhone;
    
    final url = Uri.parse('https://wa.me/$phoneNumber?text=$message');
    
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  /// Make phone call
  Future<void> _makePhoneCall(String phone) async {
    final cleanPhone = phone.replaceAll(RegExp(r'[^\d+]'), '');
    final url = Uri.parse('tel:$cleanPhone');
    
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  Future<void> _refreshData() async {
    ref.invalidate(auctionDetailsProvider(widget.auctionId));
  }
}

/// Shimmer loading for auction details
class _AuctionDetailsShimmer extends StatelessWidget {
  const _AuctionDetailsShimmer();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image placeholder
          Container(
            height: 300,
            color: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBase,
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Badges
                Row(
                  children: [
                    Container(
                      height: 24,
                      width: 60,
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBase,
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      height: 24,
                      width: 50,
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBase,
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Title
                Container(
                  height: 28,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBase,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 8),
                // Subtitle
                Container(
                  height: 18,
                  width: 200,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBase,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 24),
                // Countdown placeholder
                Container(
                  height: 80,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBase,
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                const SizedBox(height: 16),
                // Price section placeholder
                Container(
                  height: 120,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBase,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                const SizedBox(height: 16),
                // Bid form placeholder
                Container(
                  height: 280,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBase,
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// YouTube Video Player Widget
class _YouTubeVideoPlayer extends StatefulWidget {
  final String videoUrl;

  const _YouTubeVideoPlayer({required this.videoUrl});

  @override
  State<_YouTubeVideoPlayer> createState() => _YouTubeVideoPlayerState();
}

class _YouTubeVideoPlayerState extends State<_YouTubeVideoPlayer> {
  late YoutubePlayerController _controller;

  @override
  void initState() {
    super.initState();
    final videoId = YoutubePlayer.convertUrlToId(widget.videoUrl);
    _controller = YoutubePlayerController(
      initialVideoId: videoId ?? '',
      flags: const YoutubePlayerFlags(
        autoPlay: false,
        mute: false,
        enableCaption: false,
        hideControls: false,
        hideThumbnail: false,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final videoId = YoutubePlayer.convertUrlToId(widget.videoUrl);
    
    if (videoId == null || videoId.isEmpty) {
      return _buildErrorWidget();
    }

    return YoutubePlayerBuilder(
      player: YoutubePlayer(
        controller: _controller,
        showVideoProgressIndicator: true,
        progressIndicatorColor: AppColors.primary,
        progressColors: ProgressBarColors(
          playedColor: AppColors.primary,
          handleColor: AppColors.primaryLight,
        ),
      ),
      builder: (context, player) {
        return AspectRatio(
          aspectRatio: 16 / 9,
          child: player,
        );
      },
    );
  }

  Widget _buildErrorWidget() {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Container(
        color: Colors.black,
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error_outline, color: Colors.white54, size: 48),
              SizedBox(height: 8),
              Text(
                'لا يمكن تشغيل الفيديو',
                style: TextStyle(color: Colors.white54),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Uploaded Video Player Widget
class _UploadedVideoPlayer extends StatefulWidget {
  final String videoUrl;

  const _UploadedVideoPlayer({required this.videoUrl});

  @override
  State<_UploadedVideoPlayer> createState() => _UploadedVideoPlayerState();
}

class _UploadedVideoPlayerState extends State<_UploadedVideoPlayer> {
  late VideoPlayerController _controller;
  bool _isInitialized = false;
  bool _isPlaying = false;
  bool _hasError = false;

  String get _fullVideoUrl => ApiEndpoints.getFullUrl(widget.videoUrl);

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  Future<void> _initializeVideo() async {
    try {
      _controller = VideoPlayerController.networkUrl(Uri.parse(_fullVideoUrl));
      await _controller.initialize();
      _controller.addListener(_videoListener);
      if (mounted) {
        setState(() => _isInitialized = true);
      }
    } catch (e) {
      debugPrint('Video initialization error: $e');
      if (mounted) {
        setState(() => _hasError = true);
      }
    }
  }

  void _videoListener() {
    if (mounted) {
      setState(() => _isPlaying = _controller.value.isPlaying);
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_videoListener);
    _controller.dispose();
    super.dispose();
  }

  void _togglePlayPause() {
    if (_controller.value.isPlaying) {
      _controller.pause();
    } else {
      _controller.play();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) {
      return AspectRatio(
        aspectRatio: 16 / 9,
        child: Container(
          color: Colors.black,
          child: const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.error_outline, color: Colors.white54, size: 48),
                SizedBox(height: 8),
                Text('لا يمكن تشغيل الفيديو', style: TextStyle(color: Colors.white54)),
              ],
            ),
          ),
        ),
      );
    }

    if (!_isInitialized) {
      return AspectRatio(
        aspectRatio: 16 / 9,
        child: Container(
          color: Colors.black,
          child: const Center(child: CircularProgressIndicator(color: Colors.white)),
        ),
      );
    }

    return AspectRatio(
      aspectRatio: _controller.value.aspectRatio,
      child: GestureDetector(
        onTap: _togglePlayPause,
        child: Stack(
          alignment: Alignment.center,
          children: [
            VideoPlayer(_controller),
            if (!_isPlaying)
              Container(
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.5),
                  shape: BoxShape.circle,
                ),
                padding: const EdgeInsets.all(12),
                child: const Icon(Icons.play_arrow, color: Colors.white, size: 40),
              ),
          ],
        ),
      ),
    );
  }
}

/// Auction Inspection Viewer Widget
class _AuctionInspectionViewer extends StatelessWidget {
  final CarInspection inspection;
  final Car? car;
  final bool isDark;

  const _AuctionInspectionViewer({
    required this.inspection,
    this.car,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // View Full Inspection Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _openFullInspection(context),
              icon: const Icon(Icons.car_repair, size: 20),
              label: const Text('عرض تقرير الفحص التفاعلي'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Divider(color: isDark ? AppColors.borderDark : AppColors.borderLight),
          const SizedBox(height: 16),
          // Mechanical status section
          _buildMechanicalSection(),
          const SizedBox(height: 16),
          Divider(color: isDark ? AppColors.borderDark : AppColors.borderLight),
          const SizedBox(height: 16),
          // Body parts section
          _buildBodyPartsSection(),
          // Tires status section
          if (inspection.tiresStatus != null) ...[
            const SizedBox(height: 16),
            Divider(color: isDark ? AppColors.borderDark : AppColors.borderLight),
            const SizedBox(height: 16),
            _buildTiresSection(),
          ],
          // Color legend
          const SizedBox(height: 16),
          Divider(color: isDark ? AppColors.borderDark : AppColors.borderLight),
          const SizedBox(height: 16),
          _buildColorLegend(),
          // Technical notes
          if (inspection.mechanical.technicalNotes.isNotEmpty) ...[
            const SizedBox(height: 16),
            Divider(color: isDark ? AppColors.borderDark : AppColors.borderLight),
            const SizedBox(height: 16),
            _buildTechnicalNotes(),
          ],
        ],
      ),
    );
  }

  void _openFullInspection(BuildContext context) {
    // Convert CarInspection to VDSInspection
    final vdsInspection = _convertToVDSInspection(inspection);
    
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => InspectionViewScreen(
          inspection: vdsInspection,
          car: car,
          language: 'ar',
        ),
      ),
    );
  }

  Widget _buildMechanicalSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'الحالة الميكانيكية',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        const SizedBox(height: 12),
        _buildMechanicalRow('المكينة', _getEngineStatusName(inspection.mechanical.engine)),
        const SizedBox(height: 8),
        _buildMechanicalRow('القير', _getTransmissionStatusName(inspection.mechanical.transmission)),
        const SizedBox(height: 8),
        _buildMechanicalRow('الشاصي', _getChassisStatusName(inspection.mechanical.chassis)),
      ],
    );
  }

  Widget _buildMechanicalRow(String label, String value) {
    final color = _getMechanicalStatusColor(value);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: color.withValues(alpha: 0.3)),
          ),
          child: Text(
            value,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBodyPartsSection() {
    // Build a combined list of parts from bodyParts and damageDetails
    final List<({String name, Color color})> allParts = [];
    
    // Add body parts
    for (final part in inspection.bodyParts) {
      // Check if this part has damage details that override the status
      final damageDetail = inspection.damageDetails?[_convertBodyPartIdToKey(part.partId)];
      Color color;
      if (damageDetail != null) {
        color = _getVDSConditionColor(damageDetail.condition);
      } else {
        color = _getPartStatusColor(part.status);
      }
      allParts.add((name: _getPartName(part.partId), color: color));
    }
    
    // Add wheel parts from damageDetails if they exist
    if (inspection.damageDetails != null) {
      final wheelParts = {
        'wheel_front_left': 'العجلة الأمامية اليسرى',
        'wheel_front_right': 'العجلة الأمامية اليمنى',
        'wheel_rear_left': 'العجلة الخلفية اليسرى',
        'wheel_rear_right': 'العجلة الخلفية اليمنى',
      };
      
      for (final entry in wheelParts.entries) {
        final damageDetail = inspection.damageDetails![entry.key];
        if (damageDetail != null) {
          // Use unique wheel colors
          final color = _getWheelConditionColor(damageDetail.condition);
          allParts.add((name: entry.value, color: color));
        }
      }
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'حالة الهيكل',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: allParts.map((part) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: part.color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: part.color.withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: part.color,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    part.name,
                    style: TextStyle(
                      fontSize: 11,
                      color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ],
    );
  }
  
  /// Convert BodyPartId to string key for damageDetails lookup
  String _convertBodyPartIdToKey(BodyPartId partId) {
    switch (partId) {
      case BodyPartId.frontBumper:
        return 'front_bumper';
      case BodyPartId.rearBumper:
        return 'rear_bumper';
      case BodyPartId.hood:
        return 'hood';
      case BodyPartId.roof:
        return 'roof';
      case BodyPartId.trunk:
        return 'trunk';
      case BodyPartId.frontLeftDoor:
        return 'left_front_door';
      case BodyPartId.frontRightDoor:
        return 'right_front_door';
      case BodyPartId.rearLeftDoor:
        return 'left_rear_door';
      case BodyPartId.rearRightDoor:
        return 'right_rear_door';
      case BodyPartId.frontLeftFender:
        return 'left_front_fender';
      case BodyPartId.frontRightFender:
        return 'right_front_fender';
      case BodyPartId.rearLeftQuarter:
        return 'left_rear_quarter';
      case BodyPartId.rearRightQuarter:
        return 'right_rear_quarter';
    }
  }
  
  /// Get color for VDS condition string
  Color _getVDSConditionColor(String condition) {
    switch (condition) {
      case 'good':
        return const Color(0xFF22c55e);  // green
      case 'scratch':
        return const Color(0xFFeab308);  // yellow
      case 'bodywork':
        return const Color(0xFFf97316);  // orange
      case 'broken':
        return const Color(0xFFef4444);  // red
      case 'painted':
        return const Color(0xFF3b82f6);  // blue
      case 'replaced':
        return const Color(0xFF8b5cf6);  // purple
      default:
        return const Color(0xFF9ca3af);  // gray - not_inspected
    }
  }
  
  /// Get unique color for wheel condition string - ألوان فريدة للعجلات
  Color _getWheelConditionColor(String condition) {
    switch (condition) {
      case 'good':
        return const Color(0xFF10b981);  // Emerald - أخضر زمردي
      case 'scratch':
        return const Color(0xFFf59e0b);  // Amber - كهرماني
      case 'bodywork':
        return const Color(0xFFf97316);  // Orange - برتقالي
      case 'broken':
        return const Color(0xFFdc2626);  // Red-600 - أحمر داكن
      case 'painted':
        return const Color(0xFF6366f1);  // Indigo - نيلي
      case 'replaced':
        return const Color(0xFFa855f7);  // Purple - بنفسجي فاتح
      default:
        return const Color(0xFF6b7280);  // Gray-500 - رمادي
    }
  }

  /// Build tires status section - حالة الإطارات
  Widget _buildTiresSection() {
    final tiresStatus = inspection.tiresStatus;
    if (tiresStatus == null) return const SizedBox.shrink();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'حالة الإطارات',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        const SizedBox(height: 12),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 8,
          crossAxisSpacing: 8,
          childAspectRatio: 3,
          children: [
            _buildTireRow('أمامي أيسر', tiresStatus.frontLeft),
            _buildTireRow('أمامي أيمن', tiresStatus.frontRight),
            _buildTireRow('خلفي أيسر', tiresStatus.rearLeft),
            _buildTireRow('خلفي أيمن', tiresStatus.rearRight),
            if (tiresStatus.spare != null)
              _buildTireRow('الاحتياطي', tiresStatus.spare!),
          ],
        ),
      ],
    );
  }

  Widget _buildTireRow(String label, String status) {
    final config = _getTireStatusConfig(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: config.color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: config.color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                config.icon,
                style: const TextStyle(fontSize: 12),
              ),
              const SizedBox(width: 4),
              Text(
                config.label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: config.color,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  ({String label, Color color, String icon}) _getTireStatusConfig(String status) {
    switch (status) {
      case 'new':
        return (label: 'جديد', color: AppColors.success, icon: '✅');
      case 'used_50':
        return (label: 'مستهلك 50%', color: AppColors.warning, icon: '⚠️');
      case 'damaged':
        return (label: 'تالف', color: AppColors.error, icon: '❌');
      default:
        return (label: 'غير محدد', color: AppColors.secondary, icon: '❓');
    }
  }

  /// Build color legend - دليل الألوان (VDS colors)
  Widget _buildColorLegend() {
    // VDS color mappings
    final vdsColors = [
      ('سليم', const Color(0xFF22c55e)),      // good - green
      ('خدش', const Color(0xFFeab308)),       // scratch - yellow
      ('سمكرة', const Color(0xFFf97316)),     // bodywork - orange
      ('كسر', const Color(0xFFef4444)),       // broken - red
      ('رش', const Color(0xFF3b82f6)),        // painted - blue
      ('تغيير', const Color(0xFF8b5cf6)),     // replaced - purple
      ('غير محدد', const Color(0xFF9ca3af)),  // not_inspected - gray
    ];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'دليل الألوان',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 8,
          children: vdsColors.map((item) => _buildLegendItem(item.$1, item.$2)).toList(),
        ),
      ],
    );
  }

  Widget _buildLegendItem(String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
      ],
    );
  }

  /// Build technical notes section
  Widget _buildTechnicalNotes() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'ملاحظات فنية',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          inspection.mechanical.technicalNotes,
          style: TextStyle(
            fontSize: 14,
            height: 1.5,
            color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
          ),
        ),
      ],
    );
  }

  String _getEngineStatusName(EngineStatus status) {
    switch (status) {
      case EngineStatus.original:
        return 'أصلي';
      case EngineStatus.replaced:
        return 'مستبدل';
      case EngineStatus.refurbished:
        return 'مجدد';
    }
  }

  String _getTransmissionStatusName(TransmissionStatus status) {
    switch (status) {
      case TransmissionStatus.original:
        return 'أصلي';
      case TransmissionStatus.replaced:
        return 'مستبدل';
    }
  }

  String _getChassisStatusName(ChassisStatus status) {
    switch (status) {
      case ChassisStatus.intact:
        return 'سليم';
      case ChassisStatus.accidentAffected:
        return 'متأثر بحادث';
      case ChassisStatus.modified:
        return 'معدل';
    }
  }

  Color _getMechanicalStatusColor(String status) {
    if (status == 'أصلي' || status == 'سليم') {
      return AppColors.success;
    } else if (status == 'مستبدل' || status == 'مجدد' || status == 'معدل') {
      return AppColors.warning;
    } else {
      return AppColors.error;
    }
  }

  String _getPartName(BodyPartId partId) {
    switch (partId) {
      case BodyPartId.frontBumper:
        return 'الصدام الأمامي';
      case BodyPartId.rearBumper:
        return 'الصدام الخلفي';
      case BodyPartId.hood:
        return 'الكبوت';
      case BodyPartId.roof:
        return 'السقف';
      case BodyPartId.trunk:
        return 'الشنطة';
      case BodyPartId.frontLeftDoor:
        return 'الباب الأمامي الأيسر';
      case BodyPartId.frontRightDoor:
        return 'الباب الأمامي الأيمن';
      case BodyPartId.rearLeftDoor:
        return 'الباب الخلفي الأيسر';
      case BodyPartId.rearRightDoor:
        return 'الباب الخلفي الأيمن';
      case BodyPartId.frontLeftFender:
        return 'الرفرف الأمامي الأيسر';
      case BodyPartId.frontRightFender:
        return 'الرفرف الأمامي الأيمن';
      case BodyPartId.rearLeftQuarter:
        return 'الربع الخلفي الأيسر';
      case BodyPartId.rearRightQuarter:
        return 'الربع الخلفي الأيمن';
    }
  }

  Color _getPartStatusColor(PartStatus status) {
    // Use VDS colors to match the color legend
    switch (status) {
      case PartStatus.original:
        return const Color(0xFF22c55e);  // VDS good - green
      case PartStatus.painted:
        return const Color(0xFF3b82f6);  // VDS painted - blue
      case PartStatus.bodywork:
        return const Color(0xFFf97316);  // VDS bodywork - orange
      case PartStatus.accident:
        return const Color(0xFFef4444);  // VDS broken - red
      case PartStatus.replaced:
        return const Color(0xFF8b5cf6);  // VDS replaced - purple
      case PartStatus.needsCheck:
        return const Color(0xFF9ca3af);  // VDS not_inspected - gray
    }
  }

  VDSInspection _convertToVDSInspection(CarInspection inspection) {
    final parts = <PartDamageData>[];
    
    for (final bodyPart in inspection.bodyParts) {
      final partKey = _convertBodyPartIdToVDSKey(bodyPart.partId);
      final condition = _convertPartStatusToVDSCondition(bodyPart.status);
      
      parts.add(PartDamageData(
        partKey: partKey,
        condition: condition,
        severity: condition.requiresSeverity ? DamageSeverity.medium : null,
      ));
    }
    
    if (inspection.damageDetails != null) {
      for (final entry in inspection.damageDetails!.entries) {
        final existingIndex = parts.indexWhere((p) => p.partKey == entry.key);
        if (existingIndex >= 0) {
          final detail = entry.value;
          parts[existingIndex] = PartDamageData(
            partKey: entry.key,
            condition: VDSPartCondition.fromString(detail.condition),
            severity: detail.severity != null 
                ? DamageSeverity.fromString(detail.severity) 
                : null,
            notes: detail.notes,
            photos: detail.photos,
          );
        } else {
          final detail = entry.value;
          parts.add(PartDamageData(
            partKey: entry.key,
            condition: VDSPartCondition.fromString(detail.condition),
            severity: detail.severity != null 
                ? DamageSeverity.fromString(detail.severity) 
                : null,
            notes: detail.notes,
            photos: detail.photos,
          ));
        }
      }
    }
    
    final vehicleInfo = car != null ? VehicleInfo(
      make: car!.brand,
      model: car!.model,
      year: car!.year,
      color: null,
      mileage: car!.kilometers,
    ) : const VehicleInfo();
    
    return VDSInspection(
      id: inspection.id,
      carId: inspection.carId,
      templateId: 1,
      templateType: _getTemplateType(inspection.bodyType),
      vehicle: vehicleInfo,
      customer: const CustomerInfo(),
      inspector: const InspectorInfo(),
      parts: parts,
      generalNotes: inspection.mechanical.technicalNotes,
      status: InspectionStatus.finalized,
      createdAt: inspection.createdAt,
      updatedAt: inspection.updatedAt,
    );
  }

  String _convertBodyPartIdToVDSKey(BodyPartId partId) {
    switch (partId) {
      case BodyPartId.frontBumper:
        return 'front_bumper';
      case BodyPartId.rearBumper:
        return 'rear_bumper';
      case BodyPartId.hood:
        return 'hood';
      case BodyPartId.roof:
        return 'roof';
      case BodyPartId.trunk:
        return 'trunk';
      case BodyPartId.frontLeftDoor:
        return 'left_front_door';
      case BodyPartId.frontRightDoor:
        return 'right_front_door';
      case BodyPartId.rearLeftDoor:
        return 'left_rear_door';
      case BodyPartId.rearRightDoor:
        return 'right_rear_door';
      case BodyPartId.frontLeftFender:
        return 'left_front_fender';
      case BodyPartId.frontRightFender:
        return 'right_front_fender';
      case BodyPartId.rearLeftQuarter:
        return 'left_rear_quarter';
      case BodyPartId.rearRightQuarter:
        return 'right_rear_quarter';
    }
  }

  VDSPartCondition _convertPartStatusToVDSCondition(PartStatus status) {
    switch (status) {
      case PartStatus.original:
        return VDSPartCondition.good;
      case PartStatus.painted:
        return VDSPartCondition.painted;
      case PartStatus.bodywork:
        return VDSPartCondition.bodywork;
      case PartStatus.accident:
        return VDSPartCondition.broken;
      case PartStatus.replaced:
        return VDSPartCondition.replaced;
      case PartStatus.needsCheck:
        return VDSPartCondition.notInspected;
    }
  }

  CarTemplateType _getTemplateType(BodyType bodyType) {
    switch (bodyType) {
      case BodyType.sedan:
        return CarTemplateType.sedan;
      case BodyType.hatchback:
        return CarTemplateType.hatchback;
      case BodyType.coupe:
        return CarTemplateType.coupe;
      case BodyType.suv:
      case BodyType.crossover:
        return CarTemplateType.suv;
      case BodyType.pickup:
      case BodyType.truck:
        return CarTemplateType.pickup;
      case BodyType.van:
      case BodyType.minivan:
        return CarTemplateType.van;
    }
  }
}
