/// BidForm Widget for Flutter Customer App
/// Requirements: 4.1, 4.2, 4.3, 4.6 - Bid form with validation and error display

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:customer_app/models/auction.dart';
import 'package:customer_app/core/constants/app_colors.dart';
import 'package:customer_app/core/utils/formatters.dart';
import 'package:customer_app/providers/auction_provider.dart';

/// Form widget for placing bids on auctions
/// Includes: bidder name input, phone number input, bid amount input, submit button
/// With validation and error display
class BidForm extends ConsumerStatefulWidget {
  final Auction auction;
  final VoidCallback? onBidPlaced;

  const BidForm({
    super.key,
    required this.auction,
    this.onBidPlaced,
  });

  @override
  ConsumerState<BidForm> createState() => _BidFormState();
}

class _BidFormState extends ConsumerState<BidForm> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _amountController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Set default bid amount to minimum bid
    _amountController.text = widget.auction.minimumBid.toStringAsFixed(0);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bidState = ref.watch(bidStateProvider);

    // Listen for errors
    ref.listen<BidState>(bidStateProvider, (previous, next) {
      if (next.error != null && previous?.error != next.error) {
        _showErrorSnackBar(next.error!);
      }
      if (next.lastBid != null && previous?.lastBid != next.lastBid) {
        _showSuccessSnackBar();
        widget.onBidPlaced?.call();
        _resetForm();
      }
    });

    if (!widget.auction.isActive) {
      return _buildAuctionEndedMessage(isDark);
    }

    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          _buildHeader(isDark),
          const SizedBox(height: 16),
          // Minimum bid info
          _buildMinimumBidInfo(isDark),
          const SizedBox(height: 16),
          // Bidder name input
          _buildNameInput(isDark),
          const SizedBox(height: 12),
          // Phone number input
          _buildPhoneInput(isDark),
          const SizedBox(height: 12),
          // Bid amount input
          _buildAmountInput(isDark),
          const SizedBox(height: 20),
          // Submit button
          _buildSubmitButton(isDark, bidState.isLoading),
        ],
      ),
    );
  }

  Widget _buildAuctionEndedMessage(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.soldBadge.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.soldBadge.withValues(alpha: 0.3)),
      ),
      child: Column(
        children: [
          Icon(
            Icons.timer_off,
            size: 48,
            color: AppColors.soldBadge,
          ),
          const SizedBox(height: 12),
          Text(
            'انتهى المزاد',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.soldBadge,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'لم يعد بإمكانك تقديم عروض على هذا المزاد',
            style: TextStyle(
              fontSize: 14,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Row(
      children: [
        Icon(
          Icons.gavel,
          color: AppColors.primary,
          size: 24,
        ),
        const SizedBox(width: 8),
        Text(
          'قدم عرضك',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
          ),
        ),
      ],
    );
  }

  Widget _buildMinimumBidInfo(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.info.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.info.withValues(alpha: 0.3)),
      ),
      child: Row(
        children: [
          Icon(
            Icons.info_outline,
            color: AppColors.info,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'الحد الأدنى للمزايدة',
                  style: TextStyle(
                    fontSize: 12,
                    color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                  ),
                ),
                Text(
                  Formatters.formatCurrency(widget.auction.minimumBid),
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.info,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNameInput(bool isDark) {
    return TextFormField(
      controller: _nameController,
      textDirection: TextDirection.rtl,
      decoration: InputDecoration(
        labelText: 'اسم المزايد',
        hintText: 'أدخل اسمك',
        prefixIcon: const Icon(Icons.person),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        filled: true,
        fillColor: isDark ? AppColors.surfaceDark : Colors.white,
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return 'يرجى إدخال اسم المزايد';
        }
        return null;
      },
    );
  }

  Widget _buildPhoneInput(bool isDark) {
    return TextFormField(
      controller: _phoneController,
      keyboardType: TextInputType.phone,
      textDirection: TextDirection.ltr,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
        LengthLimitingTextInputFormatter(12),
      ],
      decoration: InputDecoration(
        labelText: 'رقم الهاتف',
        hintText: '777123456',
        prefixIcon: const Icon(Icons.phone),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        filled: true,
        fillColor: isDark ? AppColors.surfaceDark : Colors.white,
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return 'يرجى إدخال رقم الهاتف';
        }
        final cleaned = value.replaceAll(RegExp(r'[^\d]'), '');
        if (cleaned.length < 9 || cleaned.length > 12) {
          return 'رقم الهاتف غير صحيح';
        }
        return null;
      },
    );
  }

  Widget _buildAmountInput(bool isDark) {
    return TextFormField(
      controller: _amountController,
      keyboardType: TextInputType.number,
      textDirection: TextDirection.ltr,
      inputFormatters: [
        FilteringTextInputFormatter.digitsOnly,
      ],
      decoration: InputDecoration(
        labelText: 'مبلغ العرض',
        hintText: 'أدخل مبلغ العرض',
        prefixIcon: const Icon(Icons.attach_money),
        suffixText: 'ر.ي',
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        filled: true,
        fillColor: isDark ? AppColors.surfaceDark : Colors.white,
      ),
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return 'يرجى إدخال مبلغ العرض';
        }
        final amount = double.tryParse(value);
        if (amount == null) {
          return 'مبلغ غير صحيح';
        }
        if (amount < widget.auction.minimumBid) {
          return 'العرض أقل من الحد الأدنى (${Formatters.formatCurrency(widget.auction.minimumBid)})';
        }
        return null;
      },
    );
  }

  Widget _buildSubmitButton(bool isDark, bool isLoading) {
    return SizedBox(
      height: 50,
      child: ElevatedButton(
        onPressed: isLoading ? null : _submitBid,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.5),
        ),
        child: isLoading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.gavel),
                  SizedBox(width: 8),
                  Text(
                    'تقديم العرض',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Future<void> _submitBid() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final input = PlaceBidInput(
      bidderName: _nameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
      amount: double.parse(_amountController.text),
    );

    // Validate using model validation
    final validationError = input.validate(
      widget.auction.currentPrice,
      widget.auction.minIncrement,
    );

    if (validationError != null) {
      _showErrorSnackBar(validationError);
      return;
    }

    await ref.read(bidStateProvider.notifier).placeBid(
      widget.auction.id,
      input,
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showSuccessSnackBar() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('تم تقديم عرضك بنجاح!'),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _resetForm() {
    _nameController.clear();
    _phoneController.clear();
    // Update amount to new minimum bid
    _amountController.text = widget.auction.minimumBid.toStringAsFixed(0);
  }
}

/// Compact bid form for inline use
class BidFormCompact extends ConsumerStatefulWidget {
  final Auction auction;
  final VoidCallback? onBidPlaced;

  const BidFormCompact({
    super.key,
    required this.auction,
    this.onBidPlaced,
  });

  @override
  ConsumerState<BidFormCompact> createState() => _BidFormCompactState();
}

class _BidFormCompactState extends ConsumerState<BidFormCompact> {
  final _amountController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _amountController.text = widget.auction.minimumBid.toStringAsFixed(0);
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bidState = ref.watch(bidStateProvider);

    if (!widget.auction.isActive) {
      return const SizedBox.shrink();
    }

    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _amountController,
            keyboardType: TextInputType.number,
            textDirection: TextDirection.ltr,
            decoration: InputDecoration(
              hintText: 'مبلغ العرض',
              suffixText: 'ر.ي',
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              filled: true,
              fillColor: isDark ? AppColors.surfaceDark : Colors.white,
            ),
          ),
        ),
        const SizedBox(width: 8),
        ElevatedButton(
          onPressed: bidState.isLoading ? null : _showBidDialog,
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: bidState.isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              : const Text('مزايدة'),
        ),
      ],
    );
  }

  void _showBidDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تقديم عرض'),
        content: BidForm(
          auction: widget.auction,
          onBidPlaced: () {
            Navigator.of(context).pop();
            widget.onBidPlaced?.call();
          },
        ),
      ),
    );
  }
}
