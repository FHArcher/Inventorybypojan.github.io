<?php
header('Content-Type: application/json');
include "../includes/db_connect.php";

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['name']) || !isset($data['quantity'])) {
        throw new Exception('Data tidak lengkap');
    }

    // Get price from inventory
    $stmt = $conn->prepare("SELECT price, quantity FROM inventory WHERE name = ?");
    $stmt->bind_param("s", $data['name']);
    $stmt->execute();
    $result = $stmt->get_result();
    $item = $result->fetch_assoc();

    if (!$item) {
        throw new Exception('Barang tidak ditemukan');
    }

    if ($item['quantity'] < $data['quantity']) {
        throw new Exception('Stok tidak mencukupi');
    }

    $price = $item['price'];
    $date = date('Y-m-d H:i:s');

    // Begin transaction
    $conn->begin_transaction();

    try {
        // Insert into output_inventory
        $stmt = $conn->prepare("INSERT INTO output_inventory (name, quantity, price, date) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sids", $data['name'], $data['quantity'], $price, $date);
        $stmt->execute();

        // Update inventory
        $stmt = $conn->prepare("UPDATE inventory SET quantity = quantity - ? WHERE name = ?");
        $stmt->bind_param("is", $data['quantity'], $data['name']);
        $stmt->execute();

        $conn->commit();
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Data berhasil disimpan'
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>