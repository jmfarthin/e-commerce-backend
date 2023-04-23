const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const allTags = await Tag.findAll({
      include: [{ model: Product, through: { attributes: [] } },]
    })
    res.status(200).json(allTags);
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const oneTag = await Tag.findByPk(req.params.id, {
      include: { model: Product, through: { attributes: [] } }
    });
    res.status(200).json(oneTag);
  } catch (error) {
    res.status(400).json(error)
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const newTag = await Tag.create(req.body)
    // added stipulation that if the tags were sent with an array of products, then
    // product tags would be created for each of them
    if (!req.body.products?.length) {
      return res.status(200).json(newTag)
    }
    let productTagData = req.body.products.map(product_id => {
      return {
        product_id,
        tag_id: newTag.id
      }
    })
    let newProductTags = await ProductTag.bulkCreate(productTagData)
    res.status(200).json(newProductTags)
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const updateTag = await Tag.update(req.body, { where: { id: req.params.id } });
    res.status(200).json(updateTag);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
});

module.exports = router;
