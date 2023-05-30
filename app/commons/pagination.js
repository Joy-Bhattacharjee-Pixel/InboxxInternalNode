exports.getPagination = (page, size) => {
    const limit = size ? + size : 3;
    const offset = page ? page * limit : 0;

    return { limit, offset };
};

exports.getPagingDataBulletins = (data, page, limit) => {
    const { count: totalItems, rows: bulletins } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, bulletins, totalPages, currentPage };
};

exports.getPagingDataInvoices = (data, page, limit) => {
    const { count: totalItems, rows: invoices } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, invoices, totalPages, currentPage };
};

exports.getPagingDataTransactions = (data, page, limit) => {
    const { count: totalItems, rows: transactions } = data;
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, transactions, totalPages, currentPage };
};

exports.getPagingDataNotifications = (data, page, limit) => {
    const { count: totalItems, rows: notifications } = data;
    const currentPage = page ? + page : 0;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, notifications, totalPages, currentPage };
};