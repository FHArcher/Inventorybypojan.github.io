<?php
include "includes/db_connect.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $quantity = $_POST["quantity"];
    $price = $_POST["price"];
    
    $sql = "INSERT INTO inventory (name, quantity, price) VALUES ('$name', '$quantity', '$price')";

    if ($conn->query($sql) === TRUE) {
        echo "Barang berhasil ditambahkan!";
    } else {
        echo "Error: " . $conn->error;
    }
}

if (isset($_GET["delete"])) {
    $id = $_GET["delete"];
    $sql = "DELETE FROM inventory WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo "Barang berhasil dihapus!";
    } else {
        echo "Error: " . $conn->error;
    }
}
?>
