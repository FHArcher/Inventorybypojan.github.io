<?php
header('Content-Type: application/json');
include "../includes/db_connect.php";

if (isset($_GET["id"])) {
    $id = $_GET["id"];
    $sql = "DELETE FROM inventory WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Barang berhasil dihapus'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Gagal menghapus barang'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'ID tidak ditemukan'
    ]);
}
?>