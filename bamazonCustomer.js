const inquirer = require('inquirer');
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'bamazon_db'

});

connection.connect(function (err) {
    if (err) throw err;
    console.log(`connected ID ${connection.threadId} \n`);
    displayProducts();
});


function displayProducts() {
    connection.query("SELECT * FROM products", function (err, products) {
        if (err) throw err;

        for (var item of products) {
            console.log(` Name: ${item.product_name} | Price: ${item.price} | ID: ${item.item_id} | ${item.stock}\n`);
        }

        checkout();

    });
}



function checkout() {


    inquirer.prompt([
        {
            type: 'input',
            message: 'Enter the ID of the item you want to buy',
            name: 'itemToBuy'
        },
        {
            type: 'input',
            message: 'How many do you want to buy?',
            name: 'quantity'
        }
    ])
        .then(answers => {

            connection.query(`SELECT * FROM products WHERE ?`,
                [
                    {
                        item_id: answers.itemToBuy
                    }
                ],
                function (err, product) {
                    if (err) throw err;

                    console.log(` ID: ${product[0].item_id} | Name: ${product[0].product_name} | Price: ${product[0].price}\n`);

                    if (product[0].stock >= answers.quantity) {
                        cashOut(product, answers.quantity)
                    }
                    else {
                        console.log('Out of Stock');
                        setTimeout(displayProducts, 5000);
                        return;
                    }


                }
            );

        });
}

function cashOut(product, quantity) {

    inquirer.prompt([
        {
            type: 'confirm',
            message: 'Are you sure?',
            name: 'confirm'
        }
    ])
        .then(ans => {
            if (ans.confirm) {
                connection.query(`UPDATE products SET stock = stock - ${quantity} WHERE item_id = ${product[0].item_id}`);
                console.log(`Thanks for shopping enjoy, your new ${product[0].product_name}`);
                connection.end();
            }
            else {
                return connection.end();
            }
        }

        );


}
