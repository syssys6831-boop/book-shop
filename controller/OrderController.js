const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const order = (req, res) => {
  const { items, delivery, totalQuantity, totalPrice, userId, firstBookTitle } =
    req.body;

  let sql =
    "INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)";
  let values = [delivery.address, delivery.receiver, delivery.contact];

  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    const delivery_id = results.insertId;

    let sqlOrder = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id) 
                    VALUES (?, ?, ?, ?, ?)`;
    let valuesOrder = [
      firstBookTitle,
      totalQuantity,
      totalPrice,
      userId,
      delivery_id,
    ];

    conn.query(sqlOrder, valuesOrder, (err, orderResults) => {
      if (err) {
        console.log(err);
        return res.status(StatusCodes.BAD_REQUEST).end();
      }

      return res.status(StatusCodes.OK).json(orderResults);
    });
  });
};

const getOrders = (req, res) => {
  res.json("주문 목록 조회");
};
const getOrderDetail = (req, res) => {
  res.json("주문 상세 상품 조회");
};

module.exports = { order, getOrders, getOrderDetail };
