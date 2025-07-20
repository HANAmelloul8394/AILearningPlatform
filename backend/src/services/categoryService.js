const { Category, SubCategory } = require('../models');
const {ValidationError,NotFoundError,} = require('../utils/errorFactory');
const {validateCategoryName,validateCategoryId} = require('../utils/validationUtils');

class CategoryService {
  // async createCategory(name) {
  //   const validation = validateCategoryName(name);
  //   if (!validation.isValid) throw new ValidationError(validation.error);

  //   const exists = await Category.findOne({ where: { name: validation.sanitized } });
  //   if (exists) throw new ValidationError('Category already exists');

  //   const category = await Category.create({ name: validation.sanitized });
  //   return category.toJSON();
  // }

  async getAllCategories() {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    return categories.map(c => c.toJSON());
  }

  async getCategoryById(id) {
    const idValidation = validateCategoryId(id, 'category');
    if (!idValidation.isValid) throw new ValidationError(idValidation.error);

    const category = await Category.findByPk(idValidation.value);
    if (!category) throw new NotFoundError('Category not found');

    return category.toJSON();
  }

  async createSubCategory({ name, category_id }) {
    const nameValidation = validateCategoryName(name);
    const idValidation = validateCategoryId(category_id, 'category');

    if (!nameValidation.isValid || !idValidation.isValid) {
      throw new ValidationError(
        [nameValidation.error, idValidation.error].filter(Boolean).join(', ')
      );
    }

    const category = await Category.findByPk(idValidation.value);
    if (!category) throw new NotFoundError('Category not found');

    const subCategory = await SubCategory.create({
      name: nameValidation.sanitized,
      category_id: idValidation.value
    });

    return subCategory.toJSON();
  }

  async getSubCategories(categoryId) {
    const idValidation = validateCategoryId(categoryId, 'category');
    if (!idValidation.isValid) throw new ValidationError(idValidation.error);

    const subCategories = await SubCategory.findAll({
      where: { category_id: idValidation.value },
      order: [['name', 'ASC']]
    });

    return subCategories.map(sc => sc.toJSON());
  }

  async exportCategories() {
    const categories = await Category.findAll({
      include: [
        {
          model: SubCategory,
          as: 'subCategories',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']]
    });return categories.map(category => {
      const cat = category.toJSON();
      return {
        id: cat.id,
        name: cat.name,
        created_at: cat.created_at,
        subCategories: cat.subCategories || []
      };
    });
  }
}

module.exports = new CategoryService();
