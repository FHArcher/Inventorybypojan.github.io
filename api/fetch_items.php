<?php
include "../includes/db_connect.php";

$sql = "SELECT * FROM inventory";
$result = $conn->query($sql);

$inventory = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $inventory[] = $row;
    }
}

echo json_encode($inventory, JSON_PRETTY_PRINT); // Tambahkan JSON_PRETTY_PRINT untuk kejelasan
?>

