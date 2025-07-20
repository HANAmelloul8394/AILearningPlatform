const categoryService = require('../services/categoryService');

class CategoryController {
  // async createCategory(req, res, next) {
  //   try {
  //     const category = await categoryService.createCategory(req.body.name);

  //     res.status(201).json({
  //       success: true,
  //       message: 'Category created successfully',
  //       data: category
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  async getAllCategories(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  async createSubCategory(req, res, next) {
    try {
      const subCategory = await categoryService.createSubCategory(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Sub-category created successfully',
        data: subCategory
      });
    } catch (error) {
      next(error);
    }
  }

  async getSubCategories(req, res, next) {
    try {
      const subCategories = await categoryService.getSubCategories(req.params.categoryId);
      
      res.json({
        success: true,
        data: subCategories
      });
    } catch (error) {
      next(error);
    }
  }
  
  async exportCategories(req, res, next) {
    try {
      const data = await categoryService.exportCategories();
      res.json({
        success: true,
        data
      });
  
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();