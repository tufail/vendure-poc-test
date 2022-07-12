/**
 * We need to add weight and weight unit of measure to the variants as custom fields. It is not required that all variants use
 * the same unit of measure: unit conversion is performed when evaluating the total order weight (see the relevant function)
 */

 import { LanguageCode, CustomFields } from "@vendure/core";


 
 const ProductVariantCustomFields: CustomFields["ProductVariant"] = [
   {
     name: "location1",
     type: "float",
     min: 0,
     defaultValue: 0,
     label: [
       { languageCode: LanguageCode.en, value: "Stock on Location 1" }, 
     ],
     
   },
   {
    name: "location2",
    type: "float",
    defaultValue: 0,
    min: 0,
    label: [
      { languageCode: LanguageCode.en, value: "Stock on Location 2" }, 
    ],
  },
  {
    name: "location3",
    type: "float",
    min: 0,
    defaultValue: 0,
    label: [
      { languageCode: LanguageCode.en, value: "Stock on Location 3" }, 
    ],
  },
   
 ];

 
 
 export default ProductVariantCustomFields;