<?php
header('Content-Type: application/json');
include "../includes/db_connect.php";

if (!isset($_GET['id'])) {
    echo json_encode([
        'status' => 'error',
        'message' => 'ID tidak ditemukan'
    ]);
    exit;
}

$id = $_GET['id'];

try {
    // Get item details before deletion
    $stmt = $conn->prepare("SELECT name, quantity FROM output_inventory WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $item = $result->fetch_assoc();

    if (!$item) {
        throw new Exception('Data tidak ditemukan');
    }

    // Begin transaction
    $conn->begin_transaction();

    try {
        // Delete from output_inventory
        $stmt = $conn->prepare("DELETE FROM output_inventory WHERE id = ?");
        $stmt->bind_param("i", $id);
        
        if (!$stmt->execute()) {
            throw new Exception('Gagal menghapus data output');
        }

        // Return stock to inventory
        $stmt = $conn->prepare("UPDATE inventory SET quantity = quantity + ? WHERE name = ?");
        $stmt->bind_param("is", $item['quantity'], $item['name']);
        
        if (!$stmt->execute()) {
            throw new Exception('Gagal memperbarui stok');
        }

        $conn->commit();
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Data berhasil dihapus'
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