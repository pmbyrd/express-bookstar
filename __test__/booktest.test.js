process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

describe("Test book class", function () {
	beforeEach(async function () {
		await db.query("DELETE FROM books");
		// insert a book into the db
		await Book.create({
			isbn: "1234567890",
			amazon_url: "http://example.com",
			author: "John Doe",
			language: "English",
			pages: 300,
			publisher: "Publisher Inc.",
			title: "Sample Book",
			year: 2017,
		});
	});

	describe("POST /books", function () {
		test("Creates a new book", async function () {
			let response = await request(app).post("/books").send({
				isbn: "0234567890",
				amazon_url: "http://exampletest.com",
				author: "Jane Doe",
				language: "English",
				pages: 300,
				publisher: "Publisher Inc.",
				title: "Sample Book",
				year: 2017,
			});
			expect(response.statusCode).toBe(201);
			expect(response.body.book).toHaveProperty("isbn");
		});
		test("Test the for error handling", async function () {
			let response = await request(app).post("/books").send({
				isbn: "0234567890",
				amazon_url: "http://exampletest.com",
			});
			expect(response.statusCode).toBe(400);
		});
		describe("GET /books", function () {
			test("Gets a list of 1 book", async function () {
				let response = await request(app).get(`/books`);
				let books = response.body.books;
				expect(books).toHaveLength(1);
				expect(books[0]).toHaveProperty("isbn");
			});
			test("Test for error handling", async function () {
				let response = await request(app).get(`/books`);
				expect(response.statusCode).toBe(200);
			});
		});
		describe("GET /books/:isbn", function () {
			test("Gets a single book", async function () {
				let response = await request(app).get(`/books/1234567890`);
				expect(response.body.book).toHaveProperty("isbn");
				expect(response.body.book.isbn).toBe("1234567890");
			});
			test("Responds with 404 if can't find book in question", async function () {
				let response = await request(app).get(`/books/999`);
				expect(response.statusCode).toBe(404);
			});
		});
		describe("PUT /books/:id", function () {
			test("Updates a single book", async function () {
				let response = await request(app).put(`/books/1234567890`).send({
					isbn: "1234567890",
					amazon_url: "http://exampletest2.com",
					author: "Jane Doe",
					language: "English",
					pages: 300,
					publisher: "Publisher Inc.",
					title: "Sample Book",
					year: 2017,
				});
				expect(response.body.book).toHaveProperty("isbn");
				expect(response.body.book.isbn).toBe("1234567890");
                console.log(response.body.book)
			});
		});
	});

    describe("DELETE /books/:id", function () {
        test("Deletes a single a book", async function () {
            let response = await request(app)
                .delete(`/books/1234567890`);
            expect(response.body).toEqual({ message: "Book deleted" });
        });
    });

    afterEach(async function () {
        await db.query("DELETE FROM books");
    });


	afterAll(async function () {
		await db.end();
	});
});
