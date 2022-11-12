import OrderContentHeaderComponent from "./order-content-header.component";
import ProductCategorySliderComponent from "./product-category-slider.component";

export default function OrderContentComponent(props) {
  const { onAddToCart, onProductItemClick, comboDetailRef, selectedTable, setShowTableManagement, addOrderCartCache } =
    props;
  return (
    <div className="order-content-container occ-padding-tlr">
      <OrderContentHeaderComponent
        currentOrderType={props?.currentOrderType}
        setShowPOSOrderDialog={props?.setShowPOSOrderDialog}
        openSelectTableComponent={props?.openSelectTableComponent}
        selectedTable={selectedTable}
        setShowTableManagement={setShowTableManagement}
      />

      <div className="category-menu-container">
        <ProductCategorySliderComponent
          onAddToCart={onAddToCart}
          onProductItemClick={onProductItemClick}
          comboDetailRef={comboDetailRef}
          addOrderCartCache={addOrderCartCache}
        />
      </div>
    </div>
  );
}
