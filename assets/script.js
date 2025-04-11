// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
    fetchInventory();
    fetchOutputData();
});

document.querySelector('.remove').addEventListener('click', function(e) {
    e.preventDefault();
    alert('🙏 Mohon Maaf, masih belum berhasil pak 🙏');
});

// Form handling
const form = document.getElementById("addItemForm");
form.replaceWith(form.cloneNode(true));
const newForm = document.getElementById("addItemForm");

newForm.addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (confirm("Apakah benar anda ingin menambahkan barang ini?")) {
        const formData = new FormData();
        formData.append("name", document.getElementById("name").value);
        formData.append("quantity", document.getElementById("quantity").value);
        formData.append("price", document.getElementById("price").value);

        fetch("process.php", {
            method: "POST",
            body: formData
        })
        .then(response => {
            if (!response.ok) throw new Error('Gagal menambahkan barang');
            return response.text();
        })
        .then(result => {
            console.log("Response from Server:", result);
            fetchInventory();
            document.getElementById("addItemForm").reset();
            alert("Barang berhasil ditambahkan!");
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Gagal menambahkan barang: " + error.message);
        });
    }
});

// Inventory Functions
function fetchInventory() {
    fetch("api/fetch_items.php")
        .then(response => response.json())
        .then(data => {
            let tableBody = document.getElementById("inventoryTable");
            tableBody.innerHTML = "";
            let indeks = 1;
            
            data.forEach(item => {
                let row = `<tr>
                    <td>${indeks}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatRupiah(item.price)}</td>
                    <td>
                        <button onclick="deleteItem(${item.id})" class="delete">Hapus</button>
                    </td>
                </tr>`;
                tableBody.innerHTML += row;
                indeks++;
            });

            updateIDs();
            calculateTotalPrice();
            updateItemDetails();
            updateItemSelect();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Gagal memuat data: ' + error.message);
        });
}

function deleteItem(id) {
    if (confirm('Apakah anda yakin ingin menghapus barang ini?')) {
        fetch(`pages/delete_item.php?id=${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.text())
        .then(text => {
            console.log('Response from server:', text);
            fetchInventory();
            alert('Barang berhasil dihapus');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menghapus barang: ' + error.message);
        });
    }
}

// Output Functions
function fetchOutputData() {
    fetch('pages/fetch_output.php')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('Data output:', data); // Debug
            const outputTable = document.getElementById('outputInventoryTable');
            outputTable.innerHTML = '';
            
            data.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatRupiah(item.price)}</td>
                    <td>${formatRupiah(item.price * item.quantity)}</td>
                    <td>
                        <button onclick="deleteOutput(${item.id})" class="delete">Hapus</button>
                    </td>
                `;
                outputTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('outputInventoryTable').innerHTML = `
                <tr><td colspan="6">Gagal memuat data: ${error.message}</td></tr>`;
        });
}

function updateOutputTable(data) {
    const outputTable = document.getElementById('outputInventoryTable');
    if (!outputTable) {
        console.error('Element dengan id "outputInventoryTable" tidak ditemukan!');
        return;
    }

    outputTable.innerHTML = '';
    
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${formatRupiah(item.price || 0)}</td>
            <td>${formatRupiah((item.price || 0) * item.quantity)}</td>
            <td>
                <button onclick="deleteOutput(${item.id})" class="delete">Hapus</button>
            </td>
        `;
        outputTable.appendChild(row);
    });

    calculateTotalPrice();
}

function saveOutputData(outputData) {
    return fetch("pages/save_output.php", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(outputData)
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'success') {
            fetchInventory();
            fetchOutputData();
            calculateTotalPrice();
            updateItemDetails();
            return result;
        } else {
            throw new Error(result.message || 'Gagal menyimpan data');
        }
    });
}


function deleteOutput(id) {
    if (confirm('Apakah anda yakin ingin menghapus data ini?')) {
        fetch(`pages/delete_output.php?id=${id}`, {
            method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                fetchOutputData();
                alert('Data berhasil dihapus');
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Gagal menghapus data: ' + error.message);
        });
    }
}

// Utility Functions
function updateIDs() {
    const rows = document.querySelectorAll('#inventoryTable tr');
    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });
}

function calculateTotalPrice() {
    let totalInput = 0;
    let totalOutput = 0;

    // Hitung total barang masuk
    const inputRows = document.querySelectorAll('#inventoryTable tr');
    inputRows.forEach(row => {
        const quantityCell = row.cells[2];
        const priceCell = row.cells[3];
        
        if (quantityCell && priceCell) {
            const quantity = parseInt(quantityCell.textContent) || 0;
            const priceText = priceCell.textContent.replace(/[^\d]/g, '');
            const price = parseInt(priceText) || 0;
            totalInput += quantity * price;
        }
    });

    // Hitung total barang keluar
    const outputRows = document.querySelectorAll('#outputInventoryTable tr');
    outputRows.forEach(row => {
        const quantityCell = row.cells[2];
        const priceCell = row.cells[3];
        
        if (quantityCell && priceCell) {
            const quantity = parseInt(quantityCell.textContent) || 0;
            const priceText = priceCell.textContent.replace(/[^\d]/g, '');
            const price = parseInt(priceText) || 0;
            totalOutput += quantity * price;
        }
    });

    // Update total nilai inventory (masuk - keluar)
    const totalNilaiInventory = totalInput - totalOutput;
    document.getElementById('totalPrice').textContent = formatRupiah(totalNilaiInventory);

    return {
        totalInput,
        totalOutput,
        totalNilaiInventory
    };
}

function formatRupiah(angka) {
    if (angka === undefined || angka === null) return 'Rp 0';
    return "Rp " + Math.round(angka).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function updateItemSelect() {
        const select = document.getElementById('itemSelect');
        const rows = document.querySelectorAll('#inventoryTable tr');
        
        select.innerHTML = '<option value="">Pilih Barang</option>';
    
        const uniqueItems = new Set();
        
        rows.forEach(row => {
            const nameCell = row.cells[1];
            if (nameCell) {
                uniqueItems.add(nameCell.textContent);
            }
        });
        
        uniqueItems.forEach(itemName => {
            const option = document.createElement('option');
            option.value = itemName;
            option.textContent = itemName;
            select.appendChild(option);
        });
    }
    
    function updateItemDetails() {
        const itemsList = document.getElementById('itemsList');
        if (!itemsList) return;
    
        let itemTotals = {};
        let totalNilaiInventory = 0;
    
    // Process input items
    document.querySelectorAll('#inventoryTable tr').forEach(row => {
        const nameCell = row.cells[1];
        const quantityCell = row.cells[2];
        const priceCell = row.cells[3];
        
        if (nameCell && quantityCell && priceCell) {
            const name = nameCell.textContent;
            const quantity = parseInt(quantityCell.textContent) || 0;
            const priceText = priceCell.textContent.replace(/[^\d]/g, '');
            const price = parseInt(priceText) || 0;

            if (!itemTotals[name]) {
                itemTotals[name] = {
                    quantity: 0,
                    subtotal: 0,
                    price: price
                };
            }
            itemTotals[name].quantity += quantity;
            itemTotals[name].subtotal += quantity * price;
        }
    });

    // Subtract output items
    document.querySelectorAll('#outputInventoryTable tr').forEach(row => {
        const nameCell = row.cells[1];
        const quantityCell = row.cells[2];
        
        if (nameCell && quantityCell && itemTotals[nameCell.textContent]) {
            const name = nameCell.textContent;
            const quantity = parseInt(quantityCell.textContent) || 0;
            const itemPrice = itemTotals[name].subtotal / itemTotals[name].quantity;
            
            itemTotals[name].quantity -= quantity;
            itemTotals[name].subtotal -= quantity * itemPrice;
        }
    });

    // Update display
    itemsList.innerHTML = '';
    Object.entries(itemTotals).forEach(([name, data]) => {
        if (data.quantity > 0) {
            const averagePrice = data.quantity > 0 ? Math.round(data.subtotal / data.quantity) : 0;
            const detailDiv = document.createElement('div');
            detailDiv.className = 'item-detail';
            detailDiv.innerHTML = `
                <div class="item-info">
                    <p class="item-header">${name}</p>
                    <ul class="item-details-list">
                        <li>Stok Tersedia: ${data.quantity} unit</li>
                        <li>Harga Rata-rata per Unit: ${formatRupiah(averagePrice)}</li>
                        <li>Nilai Total: ${formatRupiah(data.subtotal)}</li>
                    </ul>
                </div>
            `;
            itemsList.appendChild(detailDiv);
            totalNilaiInventory += data.subtotal;
        }
    });


    // Add total section
    const totalDiv = document.createElement('div');
    totalDiv.className = 'total-section';
    totalDiv.innerHTML = `
        <hr>
        <p class="total-value">Total Nilai Seluruh Inventory: ${formatRupiah(totalNilaiInventory)}</p>
    `;
    itemsList.appendChild(totalDiv);
}
     
    itemsList.innerHTML = '';
    Object.entries(itemTotals).forEach(([name, data]) => {
        if (data.quantity > 0) {
            const averagePrice = Math.round(data.subtotal / data.quantity);
            const detailDiv = document.createElement('div');
            detailDiv.className = 'item-detail';
            detailDiv.innerHTML = `
                <div class="item-info">
                    <p class="item-header">${name}</p>
                    <ul class="item-details-list">
                        <li>Total Jumlah: ${data.quantity} unit</li>
                        <li>Harga Rata-rata per Unit: ${formatRupiah(averagePrice)}</li>
                        <li>Nilai Total: ${formatRupiah(data.subtotal)}</li>
                    </ul>
                </div>
            `;
            itemsList.appendChild(detailDiv);
        } else {
            console.log(`Skipping item "${name}" with non-positive quantity: ${data.quantity}`);
        }
    });

    const totalDiv = document.createElement('div');
    totalDiv.className = 'total-section';
    totalDiv.innerHTML = `
        <hr>
        <p class="total-value">Total Nilai Seluruh Inventory: ${formatRupiah(totalNilaiInventory)}</p>
    `;
    itemsList.appendChild(totalDiv);

    // Add removeItemForm event listener here
    document.getElementById('removeItemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('itemSelect').value;
        const quantity = parseInt(document.getElementById('removeQuantity').value);
        
        if (!name) {
            alert('Silakan pilih barang!');
            return;
        }

        if (isNaN(quantity) || quantity <= 0) {
            alert('Jumlah harus lebih dari 0!');
            return;
        }

        const outputData = {
            name: name,
            quantity: quantity
        };

        saveOutputData(outputData)
            .then(data => {
                if (data.status === 'success') {
                    alert('Stok berhasil dikurangi!');
                    document.getElementById('removeItemForm').reset();
                    fetchInventory();
                    fetchOutputData();
                    updateItemDetails();
                } else {
                    throw new Error(data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Gagal mengurangi stok: ' + error.message);
            });
    });

        // Kirim data ke server
        fetch('pages/save_output.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(outputData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Stok berhasil dikurangi!');
                document.getElementById('removeItemForm').reset();
                fetchInventory();
                fetchOutputData();
            } else {
                throw new Error(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Gagal mengurangi stok: ' + error.message);
        });
