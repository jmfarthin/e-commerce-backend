const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const allProducts = await Product.findAll({
      include: [{ model: Category }, { model: Tag, through: { attributes: [] } }]
    });
    res.status(200).json(allProducts);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // includes associated Category and Tag data
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag, through: { attributes: [] } }]
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(error);
  }
});

// create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tags: [1, 2, 3, 4]
    }
  */
  try {
    const newProduct = await Product.create(req.body)
    // adds new product tags if the product has tags
    if (req.body.tags?.length) {
      const productTagsArr = req.body.tags.map(tag_id => {
        return {
          product_id: newProduct.id,
          tag_id
        }
      })
      //returns new product and product tags
      const newProductTags = await ProductTag.bulkCreate(productTagsArr)
      return res.status(200).json({ newProduct, newProductTags })
    }
    res.status(200).json(newProduct)
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }


});

// update product
router.put('/:id', async (req, res) => {
  try {
    const productUpdate = await Product.update(req.body, { where: { id: req.params.id, }, })
    // find all associated tags from ProductTag
    const productTags = await ProductTag.findAll({ where: { product_id: req.params.id } });
    // get list of current tag_ids
    const productTagIds = productTags.map(({ tag_id }) => tag_id);
    // create filtered list of new tag_ids
    const newProductTags = req.body.tags.filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });
    // figure out which ones to remove
    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tags.includes(tag_id))
      .map(({ id }) => id);
    // run both actions
    await ProductTag.destroy({ where: { id: productTagsToRemove } });
    const updatedProductTags = await ProductTag.bulkCreate(newProductTags);
    res.json(updatedProductTags)
  } catch (error) {
    res.status(500).json(error);
  }
});


router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try {
    const productDelete = await Product.destroy({
      where: {
        id: req.params.id
      }
    })
    if (!productDelete) {
      return res.status(400).json('No product found!');
    }
    res.status(200).json(productDelete);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
