/**
 * This file is constant file for order status
 * mapping to EnumOrderStatus in Backend
 */
export const OrderStatus = {
  /// <summary>
  /// New order
  /// </summary>
  New: 0,

  /// <summary>
  /// Order returned
  /// </summary>
  Returned: 1,

  /// <summary>
  /// Order canceled
  /// </summary>
  Canceled: 2,

  /// <summary>
  /// Order confirmed
  /// </summary>
  ToConfirm: 3,

  /// <summary>
  /// Order on processing
  /// </summary>
  Processing: 4,

  /// <summary>
  /// Order on delivering
  /// </summary>
  Delivering: 5,

  /// <summary>
  /// Order completed
  /// </summary>
  Completed: 6,

  /// <summary>
  /// Order Draft
  /// </summary>
  Draft: 7,
};
