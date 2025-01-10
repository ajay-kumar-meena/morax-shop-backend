import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import { nodeCache } from '../app.js'
import { ErrorHandler } from '../utils/utility.js';

import {
  deletFilesFromCloudinary,
  invalidateCache,
  uploadFilesToCloudinary,
} from "../utils/features.js";

// Revalidate on New, Update, Delete Product & on New Order
export const getlatestProducts = TryCatch(async (req, res, next) => {
  nodeCache.del("lastest-products");

  // let products = nodeCache.get("latest-products");
  let products = null;
  
  if (!products) {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(7);
    nodeCache.set("latest-products", products, 600); 
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// Revalidate on New, Update, Delete Product & on New Order
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories = nodeCache.get("categories");

  if (!categories) {
    categories = await Product.distinct("category");
    nodeCache.set("categories", categories, 600); 
  }

  return res.status(200).json({
    success: true,
    categories,
  });
});

// Revalidate on New, Update, Delete Product & on New Order
export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products = nodeCache.get("all-products");

  if (!products) {
    products = await Product.find({});
    nodeCache.set("all-products", products, 600); 
  }

  return res.status(200).json({
    success: true,
    products,
  });
});


export const getSingleProduct = TryCatch(async (req, res,next)=>{
  const id = req.params.id;
  
  const product = await Product.findById(id);
    
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

    
  

  return res.status(200).json({
    success: true,
    product,
  });
})




export const newProduct = TryCatch(async (req, res, next) => {
  const { name, price, salePrice, brand, stock, category, description } = req.body;
  const photos = req.files;

  if (!photos) return next(new ErrorHandler("Please add Photo", 400));

  // if (photos.length < 1)
    // return next(new ErrorHandler("Please add at least one Photo", 400));

  if (photos.length > 5)
    return next(new ErrorHandler("You can only upload 5 Photos", 400));

  if (!name || !price || !salePrice || !brand || !stock || !category || !description)
    return next(new ErrorHandler("Please enter All Fields", 400));

  // Upload photos
  const photosURL = await uploadFilesToCloudinary(photos);

  await  Product.create({
    name,
    price,
    salePrice,
    description,
    stock,
    category: category.toLowerCase(),
    brand: brand.toLowerCase(),
    photos: photosURL,
  });
  

  await invalidateCache({ product: true });

  return res.status(201).json({
    success: true,
    message: "Product Created Successfully",
  });
});

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, salePrice, price, stock, category, description } = req.body;
  const photos = req.files;

  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  if (photos && photos.length > 0) {
    const photosURL = await uploadFilesToCloudinary(photos);

    const ids = product.photos.map((photo) => photo.public_id);
    await deletFilesFromCloudinary(ids);

    product.photos = photosURL;
  }

  if (name) product.name = name;
  if (salePrice) product.price = salePrice;
  if(price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;
  if (description) product.description = description;

  await product.save();

  await invalidateCache({
    product: true,
    productId: String(product._id),
  });

  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  const ids = product.photos.map((photo) => photo.public_id);
  await deletFilesFromCloudinary(ids);

  await product.deleteOne();

  await invalidateCache({
    product: true,
    productId: String(product._id),
  });

  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProducts = TryCatch(async (req, res) => {
  const { search, sort, brand, price } = req.query;
  const page = Number(req.query.page) || 1; 
  let products, totalPage;

  const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
  const skip = (page - 1) * limit;

  const regEx = new RegExp(search, "i");  // Use `search` instead of undefined `keyword`

  const baseQuery = {};

  // Build the base query based on filters
  if (search) {
    baseQuery.$or = [
      { name: regEx },
      { description: regEx },
      { category: regEx },
      { brand: regEx },
    ];
  }

  if (price) {
    baseQuery.salePrice = {
      $lte: Number(price),
    };
  }

  if (brand) {
    baseQuery.brand = brand;
  }

  console.log("baseQuery is: ", baseQuery);

  // Fetch products based on filters and sorting
  const productsPromise = Product.find(baseQuery)
    .sort(sort && { salePrice: sort === "asc" ? 1 : -1 })
    .limit(limit)
    .skip(skip);

  // Fetch total products to calculate total pages
  const filteredOnlyProduct = await Product.find(baseQuery);

  products = await productsPromise;
  totalPage = Math.ceil(filteredOnlyProduct.length / limit);

  return res.status(200).json({
    success: true,
    products,
    totalPage,
  });
});





// export const getAllProducts = TryCatch(async (req, res) => {
//   const { search, sort, brand, price } = req.query;
//   const page = Number(req.query.page) || 1;

//   console.log("search: " + search);
//   console.log("sort: " + sort);
//   console.log("brand: " + brand);
//   console.log("price: " + price);
//   console.log("page: " + page);
  

//   const key = `productss-${search}-${sort}-${brand}-${price}-${page}`;

//   let cachedData = nodeCache.get(key);
//   let products, totalPage;

//   if (cachedData) {
//     totalPage = cachedData.totalPage;
//     products = cachedData.products;
//   } else {
//     const limit = Number(process.env.PRODUCT_PER_PAGE) || 10;
//     const skip = (page - 1) * limit;

//     const baseQuery = {};

//     if (search) {
//       baseQuery.name = {
//         $regex: search,
//         $options: "i",
//       };
//     }

//     if (price) {
//       baseQuery.salePrice = {
//         $lte: Number(price),
//       };
//     }

//     if (brand) baseQuery.brand = brand;

//     const productsPromise = Product.find(baseQuery)
//       .sort(sort && { price: sort === "asc" ? 1 : -1 })
//       .limit(limit)
//       .skip(skip);

//     const [productsFetched, filteredOnlyProduct] = await Promise.all([
//       productsPromise,
//       Product.find(baseQuery),
//     ]);

//     products = productsFetched;
//     totalPage = Math.ceil(filteredOnlyProduct.length / limit);

//     nodeCache.set(key, { products, totalPage }, 600); 
//   }

//   return res.status(200).json({
//     success: true,
//     products,
//     totalPage,
//   });
// });
