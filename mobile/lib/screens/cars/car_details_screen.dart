/// Car Details Screen for Flutter Customer App
/// Requirements: 3.1-3.7, 4.1, 4.2 - Display car details with gallery, video, inspection, and contact
library;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import 'package:video_player/video_player.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/constants/app_strings.dart';
import 'package:customer_app/core/utils/formatters.dart';
import 'package:customer_app/core/api/api_endpoints.dart';
import 'package:customer_app/models/car.dart';
import 'package:customer_app/models/inspection.dart';
import 'package:customer_app/providers/car_provider.dart';
import 'package:customer_app/providers/settings_provider.dart';
import 'package:customer_app/widgets/image_gallery.dart';
import 'package:customer_app/widgets/contact_buttons.dart';
import 'package:customer_app/widgets/loading_widget.dart';
import 'package:customer_app/widgets/error_widget.dart';
import 'package:customer_app/screens/auctions/auction_details_screen.dart';
import 'package:customer_app/screens/inspection/inspection_view_screen.dart';

/// Car Details Screen - شاشة تفاصيل السيارة
/// Requirements: 3.1-3.7, 4.1, 4.2
class CarDetailsScreen extends ConsumerStatefulWidget {
  /// Car ID to display
  final int carId;

  /// Optional pre-loaded car data
  final Car? initialCar;

  const CarDetailsScreen({
    super.key,
    required this.carId,
    this.initialCar,
  });

  @override
  ConsumerState<CarDetailsScreen> createState() => _CarDetailsScreenState();
}

class _CarDetailsScreenState extends ConsumerState<CarDetailsScreen> {
  bool _viewCountIncremented = false;

  @override
  void initState() {
    super.initState();
    // Increment view count when screen opens
    // Requirements: 3.6
    _incrementViewCount();
  }

  Future<void> _incrementViewCount() async {
    if (!_viewCountIncremented) {
      _viewCountIncremented = true;
      await incrementCarViewCount(ref, widget.carId);
    }
  }

  Future<void> _refreshData() async {
    ref.invalidate(carDetailsProvider(widget.carId));
  }

  /// Share car details
  /// Requirements: 3.7
  Future<void> _shareCar(Car car) async {
    final shareText = '''
🚗 ${car.name}
📌 الماركة: ${car.brand}
📋 الموديل: ${car.model}
📅 السنة: ${car.year}
💰 السعر: ${Formatters.formatCurrency(car.price)}
🔹 الحالة: ${car.condition == CarCondition.newCar ? AppStrings.newCar : AppStrings.usedCar}

معرض السيارات - تصفح أفضل السيارات المتاحة
''';

    await Share.share(shareText, subject: car.name);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final carAsync = ref.watch(carDetailsProvider(widget.carId));
    final settingsAsync = ref.watch(settingsProvider);

    return Scaffold(
      backgroundColor: isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      body: carAsync.when(
        data: (car) => settingsAsync.when(
          data: (settings) => _buildContent(car, settings, isDark),
          loading: () => _buildContent(car, null, isDark),
          error: (_, __) => _buildContent(car, null, isDark),
        ),
        loading: () => const CarDetailsShimmer(),
        error: (error, stack) => AppErrorWidget(
          message: error.toString(),
          onRetry: _refreshData,
        ),
      ),
    );
  }

  Widget _buildContent(Car car, dynamic settings, bool isDark) {
    return CustomScrollView(
      slivers: [
        // App bar with image gallery
        _buildSliverAppBar(car, isDark),
        // Car details content
        SliverToBoxAdapter(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Car info header
              _buildCarHeader(car, isDark),
              // Auction section (if car is auction type)
              if (car.isAuction && car.auction != null)
                _buildAuctionSection(car, isDark)
              else
                // Price section (for fixed price cars)
                _buildPriceSection(car, isDark),
              // Car specifications
              _buildSpecificationsSection(car, isDark),
              // Video section (if available)
              if (car.video != null) _buildVideoSection(car.video!, isDark),
              // Inspection section (for used cars)
              if (car.condition == CarCondition.used && car.inspection != null)
                _buildInspectionSection(car.inspection!, car, isDark),
              // Description section
              if (car.description.isNotEmpty)
                _buildDescriptionSection(car, isDark),
              // Specifications text section
              if (car.specifications.isNotEmpty)
                _buildSpecificationsTextSection(car, isDark),
              // Bottom padding for contact buttons
              const SizedBox(height: 100),
            ],
          ),
        ),
      ],
    );
  }

  /// Sliver app bar with image gallery
  Widget _buildSliverAppBar(Car car, bool isDark) {
    return SliverAppBar(
      expandedHeight: 350,
      pinned: true,
      backgroundColor: isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
      foregroundColor: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
      actions: [
        // Share button - Requirements: 3.7
        IconButton(
          icon: const Icon(Icons.share),
          onPressed: () => _shareCar(car),
          tooltip: AppStrings.share,
        ),
      ],
      flexibleSpace: FlexibleSpaceBar(
        background: ImageGallery(
          images: car.images,
          thumbnailUrl: car.thumbnail,
          height: 350,
          showIndicator: true,
          enableZoom: true,
        ),
      ),
    );
  }

  /// Car header with name, brand, model
  Widget _buildCarHeader(Car car, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Badges row
          Row(
            children: [
              // Condition badge
              _buildBadge(
                car.condition == CarCondition.newCar
                    ? AppStrings.newCar
                    : AppStrings.usedCar,
                car.condition == CarCondition.newCar
                    ? AppColors.newBadge
                    : AppColors.usedBadge,
              ),
              const SizedBox(width: 8),
              // Featured badge
              if (car.isFeatured)
                _buildBadge(AppStrings.featured, AppColors.featuredBadge),
              const Spacer(),
              // View count
              Row(
                children: [
                  Icon(
                    Icons.visibility,
                    size: 16,
                    color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    Formatters.formatViewCount(car.viewCount),
                    style: TextStyle(
                      fontSize: 12,
                      color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Car name
          Text(
            car.name,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
          ),
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
      ),
    );
  }

  Widget _buildBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  /// Auction section - قسم المزاد
  Widget _buildAuctionSection(Car car, bool isDark) {
    final auction = car.auction!;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.auctionBadge.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.auctionBadge.withValues(alpha: 0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Auction badge and timer
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.auctionBadge,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.gavel, color: Colors.white, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      AppStrings.auction,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              // Countdown timer
              _buildCountdownTimer(auction.endTime, isDark),
            ],
          ),
          const SizedBox(height: 16),
          // Current price
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'السعر الحالي',
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
                  color: AppColors.auctionBadge,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Starting price and bid count
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'سعر البداية: ${Formatters.formatCurrency(auction.startingPrice)}',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
                ),
              ),
              Text(
                'عدد العروض: ${auction.bidCount}',
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // View auction button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _navigateToAuction(car),
              icon: const Icon(Icons.gavel),
              label: const Text('عرض تفاصيل المزاد'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.auctionBadge,
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
  }

  /// Build countdown timer widget
  Widget _buildCountdownTimer(DateTime endTime, bool isDark) {
    final remaining = endTime.difference(DateTime.now());
    if (remaining.isNegative) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.red.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(4),
        ),
        child: const Text(
          'انتهى',
          style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
        ),
      );
    }

    final days = remaining.inDays;
    final hours = remaining.inHours % 24;
    final minutes = remaining.inMinutes % 60;

    return Row(
      children: [
        _buildTimeBox(days.toString(), 'يوم', isDark),
        const SizedBox(width: 4),
        _buildTimeBox(hours.toString().padLeft(2, '0'), 'ساعة', isDark),
        const SizedBox(width: 4),
        _buildTimeBox(minutes.toString().padLeft(2, '0'), 'دقيقة', isDark),
      ],
    );
  }

  Widget _buildTimeBox(String value, String label, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.auctionBadge.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.auctionBadge,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 8,
              color: isDark ? AppColors.textHintDark : AppColors.textHintLight,
            ),
          ),
        ],
      ),
    );
  }

  /// Navigate to auction details
  void _navigateToAuction(Car car) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => AuctionDetailsScreen(
          auctionId: car.auction!.id,
          initialAuction: car.auction,
        ),
      ),
    );
  }

  /// Price section
  Widget _buildPriceSection(Car car, bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            AppStrings.price,
            style: TextStyle(
              fontSize: 16,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
          Text(
            Formatters.formatCurrency(car.price),
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }

  /// Specifications section with key details
  Widget _buildSpecificationsSection(Car car, bool isDark) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        children: [
          _buildSpecRow(AppStrings.brand, car.brand, isDark),
          _buildDivider(isDark),
          _buildSpecRow(AppStrings.model, car.model, isDark),
          _buildDivider(isDark),
          _buildSpecRow(AppStrings.year, car.year.toString(), isDark),
          _buildDivider(isDark),
          _buildSpecRow(
            AppStrings.condition,
            car.condition == CarCondition.newCar
                ? AppStrings.newCar
                : AppStrings.usedCar,
            isDark,
          ),
          if (car.origin != null && car.origin!.isNotEmpty) ...[
            _buildDivider(isDark),
            _buildSpecRow(AppStrings.origin, car.origin!, isDark),
          ],
          if (car.kilometers != null) ...[
            _buildDivider(isDark),
            _buildSpecRow(
              AppStrings.kilometers,
              Formatters.formatKilometers(car.kilometers!),
              isDark,
            ),
          ],
          if (car.bodyType != null) ...[
            _buildDivider(isDark),
            _buildSpecRow(
              'نوع الهيكل',
              _getBodyTypeName(car.bodyType!),
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

  String _getBodyTypeName(BodyType bodyType) {
    switch (bodyType) {
      case BodyType.sedan:
        return 'سيدان';
      case BodyType.hatchback:
        return 'هاتشباك';
      case BodyType.coupe:
        return 'كوبيه';
      case BodyType.suv:
        return 'SUV';
      case BodyType.crossover:
        return 'كروس أوفر';
      case BodyType.pickup:
        return 'بيك أب';
      case BodyType.van:
        return 'فان';
      case BodyType.minivan:
        return 'ميني فان';
      case BodyType.truck:
        return 'شاحنة';
    }
  }

  /// Video section
  /// Requirements: 3.4
  Widget _buildVideoSection(CarVideo video, bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle(AppStrings.video, Icons.play_circle_outline, isDark),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: video.type == CarVideoType.youtube
                ? _YouTubeVideoPlayer(videoUrl: video.url)
                : _UploadedVideoPlayer(videoUrl: video.url),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  /// Inspection section for used cars
  /// Requirements: 3.5
  Widget _buildInspectionSection(CarInspection inspection, Car car, bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle(AppStrings.inspection, Icons.fact_check_outlined, isDark),
          const SizedBox(height: 12),
          _InspectionViewer(inspection: inspection, car: car, isDark: isDark),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  /// Description section
  Widget _buildDescriptionSection(Car car, bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle(AppStrings.description, Icons.description_outlined, isDark),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDark ? AppColors.borderDark : AppColors.borderLight,
              ),
            ),
            child: Text(
              car.description,
              style: TextStyle(
                fontSize: 14,
                height: 1.6,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  /// Specifications text section
  Widget _buildSpecificationsTextSection(Car car, bool isDark) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle(AppStrings.specifications, Icons.list_alt, isDark),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDark ? AppColors.borderDark : AppColors.borderLight,
              ),
            ),
            child: Text(
              car.specifications,
              style: TextStyle(
                fontSize: 14,
                height: 1.6,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, IconData icon, bool isDark) {
    return Row(
      children: [
        Icon(
          icon,
          size: 20,
          color: AppColors.primary,
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
      ],
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
        onReady: () {
          // Player is ready
        },
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

/// Uploaded Video Player Widget with enhanced controls
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
  bool _showControls = true;

  String get _fullVideoUrl {
    // Convert relative URL to full URL using ApiEndpoints
    return ApiEndpoints.getFullUrl(widget.videoUrl);
  }

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  Future<void> _initializeVideo() async {
    try {
      debugPrint('Video URL: $_fullVideoUrl');
      _controller = VideoPlayerController.networkUrl(Uri.parse(_fullVideoUrl));
      await _controller.initialize();
      _controller.addListener(_videoListener);
      if (mounted) {
        setState(() {
          _isInitialized = true;
        });
      }
    } catch (e) {
      debugPrint('Video initialization error: $e');
      if (mounted) {
        setState(() {
          _hasError = true;
        });
      }
    }
  }

  void _videoListener() {
    if (mounted) {
      setState(() {
        _isPlaying = _controller.value.isPlaying;
      });
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

  void _seekForward() {
    final currentPosition = _controller.value.position;
    final duration = _controller.value.duration;
    final newPosition = currentPosition + const Duration(seconds: 10);
    _controller.seekTo(newPosition > duration ? duration : newPosition);
  }

  void _seekBackward() {
    final currentPosition = _controller.value.position;
    final newPosition = currentPosition - const Duration(seconds: 10);
    _controller.seekTo(newPosition < Duration.zero ? Duration.zero : newPosition);
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }

  void _toggleControls() {
    setState(() {
      _showControls = !_showControls;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) {
      return _buildErrorWidget();
    }

    if (!_isInitialized) {
      return _buildLoadingWidget();
    }

    return AspectRatio(
      aspectRatio: _controller.value.aspectRatio,
      child: GestureDetector(
        onTap: _toggleControls,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Video
            VideoPlayer(_controller),
            
            // Controls overlay
            AnimatedOpacity(
              opacity: _showControls || !_isPlaying ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 300),
              child: Container(
                color: Colors.black.withValues(alpha: 0.3),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Main controls row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Rewind 10s
                        IconButton(
                          onPressed: _seekBackward,
                          icon: const Icon(Icons.replay_10, color: Colors.white, size: 36),
                        ),
                        const SizedBox(width: 24),
                        // Play/Pause
                        GestureDetector(
                          onTap: _togglePlayPause,
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.5),
                              shape: BoxShape.circle,
                            ),
                            padding: const EdgeInsets.all(12),
                            child: Icon(
                              _isPlaying ? Icons.pause : Icons.play_arrow,
                              color: Colors.white,
                              size: 40,
                            ),
                          ),
                        ),
                        const SizedBox(width: 24),
                        // Forward 10s
                        IconButton(
                          onPressed: _seekForward,
                          icon: const Icon(Icons.forward_10, color: Colors.white, size: 36),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            
            // Bottom progress bar and time
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.7),
                      Colors.transparent,
                    ],
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Progress slider
                    SliderTheme(
                      data: SliderTheme.of(context).copyWith(
                        trackHeight: 3,
                        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
                        overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
                        activeTrackColor: AppColors.primary,
                        inactiveTrackColor: Colors.white.withValues(alpha: 0.3),
                        thumbColor: AppColors.primary,
                      ),
                      child: Slider(
                        value: _controller.value.position.inMilliseconds.toDouble(),
                        min: 0,
                        max: _controller.value.duration.inMilliseconds.toDouble(),
                        onChanged: (value) {
                          _controller.seekTo(Duration(milliseconds: value.toInt()));
                        },
                      ),
                    ),
                    // Time display
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _formatDuration(_controller.value.position),
                            style: const TextStyle(color: Colors.white, fontSize: 12),
                          ),
                          Text(
                            _formatDuration(_controller.value.duration),
                            style: const TextStyle(color: Colors.white, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLoadingWidget() {
    return AspectRatio(
      aspectRatio: 16 / 9,
      child: Container(
        color: Colors.black,
        child: const Center(
          child: CircularProgressIndicator(
            color: Colors.white,
            strokeWidth: 2,
          ),
        ),
      ),
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

/// Inspection Viewer Widget
/// Requirements: 3.5 - Display inspection data for used cars
class _InspectionViewer extends StatelessWidget {
  final CarInspection inspection;
  final Car? car;
  final bool isDark;

  const _InspectionViewer({
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
          _buildViewFullInspectionButton(context),
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

  /// Build button to view full interactive inspection
  Widget _buildViewFullInspectionButton(BuildContext context) {
    return SizedBox(
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
    );
  }

  /// Open full interactive inspection screen
  void _openFullInspection(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => _FullInspectionScreen(inspection: inspection, car: car),
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
        // Group body parts by status
        _buildBodyPartsGrid(),
      ],
    );
  }

  Widget _buildBodyPartsGrid() {
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
    
    return Wrap(
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
}

/// Car Details Screen with Bottom Contact Buttons
/// This is a wrapper that adds floating contact buttons
class CarDetailsScreenWithContact extends ConsumerWidget {
  final int carId;
  final Car? initialCar;

  const CarDetailsScreenWithContact({
    super.key,
    required this.carId,
    this.initialCar,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final carAsync = ref.watch(carDetailsProvider(carId));
    final settingsAsync = ref.watch(settingsProvider);

    return Scaffold(
      body: CarDetailsScreen(
        carId: carId,
        initialCar: initialCar,
      ),
      bottomNavigationBar: carAsync.when(
        data: (car) => settingsAsync.when(
          data: (settings) => FloatingContactButtons(
            car: car,
            settings: settings,
          ),
          loading: () => const SizedBox.shrink(),
          error: (_, __) => const SizedBox.shrink(),
        ),
        loading: () => const SizedBox.shrink(),
        error: (_, __) => const SizedBox.shrink(),
      ),
    );
  }
}

/// Inspection Status Legend Widget
class InspectionLegend extends StatelessWidget {
  const InspectionLegend({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceDark : AppColors.surfaceLight,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isDark ? AppColors.borderDark : AppColors.borderLight,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'دليل الألوان',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 12,
            runSpacing: 8,
            children: [
              _buildLegendItem('أصلي', AppColors.success, isDark),
              _buildLegendItem('مدهون', AppColors.info, isDark),
              _buildLegendItem('معمول سمكرة', AppColors.warning, isDark),
              _buildLegendItem('حادث', AppColors.error, isDark),
              _buildLegendItem('مستبدل', const Color(0xFFFF9800), isDark),
              _buildLegendItem('يحتاج فحص', AppColors.secondary, isDark),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(String label, Color color, bool isDark) {
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
}


/// Full Inspection Screen - شاشة الفحص التفاعلي الكامل
/// Converts CarInspection to VDSInspection and displays interactive SVG viewer
class _FullInspectionScreen extends StatelessWidget {
  final CarInspection inspection;
  final Car? car;

  const _FullInspectionScreen({required this.inspection, this.car});

  @override
  Widget build(BuildContext context) {
    // Convert CarInspection to VDSInspection
    final vdsInspection = _convertToVDSInspection(inspection);
    
    // Get template type from body type
    final templateType = _getTemplateType(inspection.bodyType);
    
    return InspectionViewScreen(
      inspection: vdsInspection,
      car: car,
      language: 'ar',
    );
  }

  /// Convert CarInspection to VDSInspection
  VDSInspection _convertToVDSInspection(CarInspection inspection) {
    // Convert body parts to VDS parts
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
    
    // Add damage details if available
    if (inspection.damageDetails != null) {
      for (final entry in inspection.damageDetails!.entries) {
        final existingIndex = parts.indexWhere((p) => p.partKey == entry.key);
        if (existingIndex >= 0) {
          // Update existing part with more details
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
          // Add new part
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
    
    // Build vehicle info from car data
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
      templateId: 1, // Default template
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

  /// Convert BodyPartId to VDS part key string
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

  /// Convert PartStatus to VDSPartCondition
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

  /// Get CarTemplateType from BodyType
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
