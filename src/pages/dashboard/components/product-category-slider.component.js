import { CloseOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { NoDataFoundComponent } from "components/no-data-found/no-data-found.component";
import { SearchPosIcon } from "constants/icons.constants";
import { ProductPlatform } from "constants/product-platform.constants";
import comboDataService from "data-services/combo/combo-data.service";
import productDataService from "data-services/product/product-data.service";
import { t } from "i18next";
import { useEffect, useState } from "react";
import { Navigation } from "swiper";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { ComboCardComponent } from "./combo-cart-detail/combo-card.component";
import "./dashboard-pos.scss";
import { ProductCardComponent } from "./product-card.component";
import "./style.scss";

export default function ProductCategorySliderComponent(props) {
  const { onAddToCart, onProductItemClick, comboDetailRef, addOrderCartCache } = props;
  const comboTab = 0;
  const [productCategories, setProductCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [combos, setCombos] = useState([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(comboTab);
  const [isComboSelected, setIsComboSelected] = useState(true); // on the first load, select combo tab
  const [openMenu, setOpenMenu] = useState(false);

  const pageData = {
    searchByProductName: t("posOrder.searchByProductName"),
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    productDataService.getProductCategoriesActivatedAsync().then((res) => {
      const { productCategories, combos } = res;
      var listCategory = [];
      if (combos) {
        let itemCombo = {
          name: "COMBO",
          isCombo: true,
        };

        listCategory.push(itemCombo);
      }

      if (productCategories) {
        listCategory = [...listCategory, ...productCategories];
        setProductCategories(listCategory);
        autoSelectDefaultProductCategory();
      }
    });
  };

  const autoSelectDefaultProductCategory = () => {
    comboDataService.getCombosActivatedAsync().then((res) => {
      const { combos } = res;
      if (combos && isComboSelected) {
        setCombos(combos);
      }
    });
  };

  const getProductByProductCategoryAsync = async (productCategory, index) => {
    if (index === comboTab) {
      const response = await comboDataService.getCombosActivatedAsync();
      const { combos } = response;
      if (combos) {
        setCombos(combos);
        setProducts([]);
      }
    } else {
      var data = { productCategoryId: productCategory.id, platform: ProductPlatform.POS };
      const response = await productDataService.getProductsInPlatformByCategoryIdAsync(data);
      const { products } = response;
      if (products) {
        setProducts(products);
        setCombos([]);
      }
    }
  };

  const onChangeCategory = async (productCategory, index) => {
    setCurrentItemIndex(index);
    setIsComboSelected(index === comboTab);
    await getProductByProductCategoryAsync(productCategory, index);
  };

  const renderProduct = () => {
    if (products?.length === 0) {
      return (
        <div className="d-flex h-100">
          <div className="text-center m-auto">
            <NoDataFoundComponent />
          </div>
        </div>
      );
    }

    const productCards = products?.map((item, index) => {
      return (
        <ProductCardComponent
          key={index}
          className="pointer"
          initData={item}
          onAddToCart={onAddToCart}
          onProductItemClick={onProductItemClick}
        />
      );
    });

    return <div className="list-product-card-pos">{productCards}</div>;
  };

  const renderCombo = () => {
    if (combos?.length === 0) {
      return (
        <div className="d-flex h-100">
          <div className="text-center m-auto">
            <NoDataFoundComponent />
          </div>
        </div>
      );
    }

    const comboCards = combos?.map((item, index) => {
      return (
        <ComboCardComponent
          key={index}
          className="pointer"
          initData={item}
          onAddToCart={onAddToCart}
          comboDetailRef={comboDetailRef}
          addOrderCartCache={addOrderCartCache}
        />
      );
    });

    return <div className="list-combo-card-pos">{comboCards}</div>;
  };

  const renderHeader = () => {
    return (
      <>
        <div
          className={`c-header-category-menu  ${
            openMenu ? "c-header-category-menu--open" : "c-header-category-menu--close"
          }`}
        >
          <div className={`menu-search `}>
            <span className="icon-search" onClick={() => setOpenMenu(true)}>
              <SearchPosIcon />
            </span>
            <div className="menu-search-box">
              <Input
                size="large"
                placeholder={pageData.searchByProductName}
                style={{ width: 300 }}
                className="input-search"
              />
              <CloseOutlined className="icon-close" onClick={() => setOpenMenu(false)} />
            </div>
          </div>
          <div className="menu-swiper">
            <Swiper
              spaceBetween={50}
              slidesPerView={"auto"}
              grabCursor={true}
              preventClicks={true}
              simulateTouch={true}
              slidesOffsetAfter={50}
              slidesPerGroupAuto={true}
              navigation={true}
              modules={[Navigation]}
              className="menu-items"
            >
              {productCategories?.map((item, index) => {
                const activateClass = index === currentItemIndex && "active";
                return (
                  <SwiperSlide
                    key={index}
                    className={`m-item ${activateClass}`}
                    onClick={() => onChangeCategory(item, index)}
                  >
                    {item?.name}
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {renderHeader()}
      <div className="content-wrapper-render occ-margin-t">
        {isComboSelected === true ? renderCombo() : renderProduct()}
      </div>
    </>
  );
}
