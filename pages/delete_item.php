<?php
include "../includes/db_connect.php";

if (isset($_GET["id"])) {
    $id = $_GET["id"];
    $sql = "DELETE FROM inventory WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo "Barang dihapus!";
    } else {
        echo "Gagal menghapus barang!";
    }
}
?>
