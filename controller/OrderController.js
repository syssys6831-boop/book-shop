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

      const order_id = orderResults.insertId;

      let valuesOrderedBook = [];
      items.forEach((item) => {
        valuesOrderedBook.push([order_id, item.book_id, item.quantity]);
      });

      let sqlOrderedBook =
        "INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?";
      conn.query(sqlOrderedBook, [valuesOrderedBook], (err, results) => {
        if (err) {
          console.log(err);
          return res.status(StatusCodes.BAD_REQUEST).end();
        }

        let result = deleteCartItems(items);
        return res.status(StatusCodes.OK).json(orderResults);
      });
    });
  });
};

const deleteCartItems = (items) => {
  let cartItemIds = items.map((item) => item.cartItemId);
  let sqlDelete = "DELETE FROM cartItems WHERE id IN (?)";

  conn.query(sqlDelete, [cartItemIds], (err, results) => {
    if (err) return console.log(err);
    return results;
  });
};

const getOrders = (req, res) => {
  res.json("주문 목록 조회");
};
const getOrderDetail = (req, res) => {
  res.json("주문 상세 상품 조회");
};

module.exports = { order, getOrders, getOrderDetail };
