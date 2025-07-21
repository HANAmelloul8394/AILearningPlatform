const { User, Prompt, Category, SubCategory } = require('../models');
const { ValidationError, NotFoundError } = require('../utils/errorFactory');
const {
  validatePassword,
  validateUserName,
  validatePhoneNumber,
  validatePagination
} = require('../utils/validationUtils');
const { Op, fn, col } = require('../../config/sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 

class UserService {
 
  async createUser(userData) {
    const { name, phone, password } = userData;
    const role = phone === process.env.ADMIN_PHONE ? 'admin' : 'user';
  
    const nameValidation = validateUserName(name);
    const phoneValidation = validatePhoneNumber(phone);
    const passValidation = validatePassword(password);
  
    if (!nameValidation.isValid || !phoneValidation.isValid || !passValidation.isValid) {
      throw new ValidationError([
        nameValidation.error,
        phoneValidation.error,
        passValidation.error
      ].filter(Boolean).join(', '));
    }
  
    try {
      const existingUser = await User.findOne({ where: { phone: phoneValidation.sanitized } });
      if (existingUser) {
        throw new ValidationError('Phone number already exists');
      }
  
      const hashedPassword = await bcrypt.hash(passValidation.value, 10);
  
      const user = await User.create({
        name: nameValidation.sanitized,
        phone: phoneValidation.sanitized,
        password: hashedPassword,
        role: role
      });
  
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );
  
      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      };
  
    } catch (error) {
      throw error;
    }
  }
  
  async getAllUsers(options = {}) {
    
     const { page = 1, limit = 10, search = '' } = options;

    const paginationValidation = validatePagination({ page, limit });
    if (!paginationValidation.isValid) {
      throw new ValidationError(paginationValidation.errors.join(', '));
    }

    const { offset } = paginationValidation.values;

    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const { count: total, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Prompt,
          as: 'prompts',
          attributes: [],
          required: false
        }
      ],
      attributes: {
        include: [
          [
            fn('COUNT', col('prompts.id')),
            'prompt_count'
          ]
        ]
      },
      group: ['User.id'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      subQuery: false,
      distinct: true
    });

    return {
      users: users.map(user => user.toJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getUserById(userId) {

    const user = await User.findByPk(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.toJSON();
  }

  async getUserHistory(userId, options = {}) {
    
    const {
      page = 1,
      limit = 10
    } = options;
  
    const paginationValidation = validatePagination({ page, limit });
    if (!paginationValidation.isValid) {
      throw new ValidationError(paginationValidation.errors.join(', '));
    }
  
    const { offset } = paginationValidation.values;
  
    const { count: total, rows: prompts } = await Prompt.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name']
        },
        {
          model: SubCategory,
          as: 'subCategory',
          attributes: ['name'],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  
    return {
      prompts: prompts.map(prompt => {
        const promptData = prompt.toJSON();
        return {
          ...promptData,
          category_name: promptData.category?.name,
          sub_category_name: promptData.subCategory?.name
        };
      }),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }  

  async deleteUser(userId) {
    
    const deletedRows = await User.destroy({
      where: { id: userId }
    });

    if (deletedRows === 0) {
      throw new NotFoundError('User not found');
    }

    return true;
  }

  async exportUsers() {
    const users = await User.findAll({
      attributes: ['id', 'name', 'phone', 'role', 'created_at'],
      order: [['created_at', 'DESC']]
    });
  
    return users.map(user => user.toJSON());
  }

  async getAllUsersWithHistory(options = {}) {
    const { page = 1, limit = 10, search = '' } = options;
  
    const paginationValidation = validatePagination({ page, limit });
    if (!paginationValidation.isValid) {
      throw new ValidationError(paginationValidation.errors.join(', '));
    }
  
    const { offset } = paginationValidation.values;
  
    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ]
    } : {};
  
    const { count: total, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Prompt,
          as: 'prompts',
          include: [
            { model: Category, as: 'category', attributes: ['name'] },
            { model: SubCategory, as: 'subCategory', attributes: ['name'], required: false }
          ],
          required: false
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });
  
    const usersWithHistory = users.map(user => {
      const userData = user.toJSON();
      userData.prompts = userData.prompts.map(prompt => ({
        ...prompt,
        category_name: prompt.category?.name,
        sub_category_name: prompt.subCategory?.name
      }));
      return userData;
    });

      return {
      users: usersWithHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
  }

  async getMe(userFromRequest) {
    if (!userFromRequest) {
      throw new NotFoundError('User not found');
    }

      return {
      id: userFromRequest.id,
      name: userFromRequest.name,
      role: userFromRequest.role
    };
  }

  async login(credentials) {
    const { phone, password } = credentials;
  
    const phoneValidation = validatePhoneNumber(phone);
    const passValidation = validatePassword(password);
  
    if (!phoneValidation.isValid || !passValidation.isValid) {
      throw new ValidationError([
        phoneValidation.error,
        passValidation.error
      ].filter(Boolean).join(', '));
    }
  
    const user = await User.findOne({ where: { phone: phoneValidation.sanitized } });
  
    if (!user) {
      throw new ValidationError('Invalid phone or password');
    }
  
    const isMatch = await bcrypt.compare(passValidation.value, user.password);
    if (!isMatch) {
      throw new ValidationError('Invalid phone or password');
    }
  
    if (user.phone === process.env.ADMIN_PHONE && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }
  
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
  
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    };
  }
  

}

module.exports = new UserService();