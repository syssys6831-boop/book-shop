const mariadb = require("mysql2/promise");
const { StatusCodes } = require("http-status-codes");

const order = async (req, res) => {
  const conn = await mariadb.createConnection({
    host: "localhost",
    user: "root",
    password: "1q2w3e4r",
    database: "Bookshop",
    dateStrings: true,
  });
  const { items, delivery, totalQuantity, totalPrice, userId, firstBookTitle } =
    req.body;

  // delivery 테이블 삽입
  let sql =
    "INSERT INTO delivery (address, receiver, contact) VALUES (?, ?, ?)";
  let values = [delivery.address, delivery.receiver, delivery.contact];
  let [results] = await conn.execute(sql, values);
  let delivery_id = results.insertId;

  // order 테이블 삽입
  sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
                    VALUES (?, ?, ?, ?, ?)`;
  values = [firstBookTitle, totalQuantity, totalPrice, userId, delivery_id];
  [results] = await conn.execute(sql, values);
  let order_id = results.insertId;

  // item을 가지고, 장바구니에서 book_id, quantity 조회
  // 반환 구조 수정: [orderItems] 로 감싸서 rows 데이터만 추출
  sql = `SELECT book_id, quantity FROM cartItems WHERE id IN (?)`;
  let [orderItems] = await conn.query(sql, [items]);

  // orderBook 테이블 삽입
  sql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?`;

  values = [];
  orderItems.forEach((item) => {
    values.push([order_id, item.book_id, item.quantity]);
  });
  results = await conn.query(sql, [values]);

  // 참조 범위 수정: items를 인자로 전달
  let result = await deleteCartItems(conn, items);

  return res.status(StatusCodes.OK).json(result);
};

// 매개변수에 items 추가
const deleteCartItems = async (conn, items) => {
  let sql = "DELETE FROM cartItems WHERE id IN (?)";

  let [result] = await conn.query(sql, [items]);
  return result;
};

const getOrders = async (req, res) => {
  const conn = await mariadb.createConnection({
    host: "localhost",
    user: "root",
    password: "1q2w3e4r",
    database: "Bookshop",
    dateStrings: true,
  });

  let sql = `SELECT orders.id, created_at, address, receiver, contact, book_title, total_quantity, total_price    
              FROM orders LEFT JOIN delivery ON orders.delivery_id = delivery.id`;
  let [rows, fields] = await conn.query(sql);
  return res.status(StatusCodes.OK).json(rows);
};

const getOrderDetail = async (req, res) => {
  const { id } = req.params;
  const conn = await mariadb.createConnection({
    host: "localhost",
    user: "root",
    password: "1q2w3e4r",
    database: "Bookshop",
    dateStrings: true,
  });

  let sql = `SELECT book_id, title, author, price, quantity    
              FROM orderedBook LEFT JOIN books
              ON orderedBook.book_id = books.id
              WHERE order_id = ?`;
  let [rows, fields] = await conn.query(sql, [id]);
  return res.status(StatusCodes.OK).json(rows);
};

module.exports = { order, getOrders, getOrderDetail };
