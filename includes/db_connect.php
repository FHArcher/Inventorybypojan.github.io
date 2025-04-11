<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "inventory_db"; // Sesuaikan dengan nama database baru

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode([
        'status' => 'error',
        'message' => "Koneksi gagal: " . $conn->connect_error
    ]));
}

$conn->set_charset("utf8");
?>