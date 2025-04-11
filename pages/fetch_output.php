<?php
header('Content-Type: application/json');
include "../includes/db_connect.php";

try {
    // Query untuk mengambil data output inventory
    $sql = "SELECT * FROM output_inventory ORDER BY date DESC";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception($conn->error);
    }

    $output_data = array();
    
    while($row = $result->fetch_assoc()) {
        $output_data[] = array(
            'id' => $row['id'],
            'name' => $row['name'],
            'quantity' => $row['quantity'],
            'date' => $row['date']
        );
    }
    
    // Debug: tampilkan jumlah data yang ditemukan
    error_log("Jumlah data output: " . count($output_data));
    
    echo json_encode($output_data);

} catch (Exception $e) {
    error_log("Error in fetch_output.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>