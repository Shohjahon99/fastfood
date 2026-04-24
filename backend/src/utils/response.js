const success = (res, data = {}, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, message = 'Xatolik', statusCode = 400, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
};

const paginate = (res, rows, count, page, limit) => {
  return res.json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
    },
  });
};

module.exports = { success, error, paginate };
