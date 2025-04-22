const paginate = async ({
    model,
    filter = {},
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    populate = ""
  }) => {
    const skip = (page - 1) * limit;
  
    let query = model.find(filter).sort(sort).skip(skip).limit(limit);
  
    // Apply populate if provided
    if (populate) {
      query = query.populate(populate);
    }
  
    const results = await query;
    const totalCount = await model.countDocuments(filter);
  
    return {
      results,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount
    };
  };
  
  module.exports = paginate;
  