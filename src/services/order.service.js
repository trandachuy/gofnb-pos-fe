const getComboProductPricingByProductGroups = (comboPricings, currentComboProductGroupProductPrices) => {
  let result = null;
  comboPricings?.forEach((combo) => {
    const { comboPricingProducts } = combo;
    let isComboProductGroup = true;
    comboPricingProducts?.map((comboPricingProduct) => {
      if (
        !currentComboProductGroupProductPrices?.find(
          (group) => group.productPriceId === comboPricingProduct?.productPriceId
        )
      ) {
        isComboProductGroup = false;
      }
    });
    if (isComboProductGroup) {
      result = combo;
    }
  });

  return result;
};

const orderService = {
  getComboProductPricingByProductGroups,
};
export default orderService;
