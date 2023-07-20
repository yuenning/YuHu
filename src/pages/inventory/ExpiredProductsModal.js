import React, { useState } from "react";
import { projectFirestore } from "../../firebase/config"; // Import projectFirestore
import { useAuthContext } from "../../hooks/useAuthContext"; // Import useAuthContext

export default function ExpiredProductsModal({ products, onClose }) {
  const { user } = useAuthContext();
  const [selectedBatches, setSelectedBatches] = useState([]);

  // Define the handleCloseModal function
  const handleCloseModal = () => {
    onClose(); // Call the onClose prop to close the modal
  };

  const handleBatchSelection = (productId, batchId, selected) => {
    if (selected) {
      // Batch is selected, add it to the selectedBatches state
      setSelectedBatches((prevSelected) => [
        ...prevSelected,
        { productId, batchId },
      ]);
    } else {
      // Batch is deselected, remove it from the selectedBatches state
      setSelectedBatches((prevSelected) =>
        prevSelected.filter(
          (batch) =>
            !(batch.productId === productId && batch.batchId === batchId)
        )
      );
    }
  };

  const handleConfirmModal = async () => {
    try {
      // Loop through each selected batch and remove it from the corresponding product
      for (const selectedBatch of selectedBatches) {
        const productId = selectedBatch.productId;
        const batchId = selectedBatch.batchId;

        // Get the reference to the product document in Firestore
        const productRef = projectFirestore
          .collection(`users/${user.uid}/products`)
          .doc(productId);

        // Get the current product data
        const productDoc = await productRef.get();
        const productData = productDoc.data();

        // Find the index of the batch with the matching batchId
        const batchIndex = productData.batchDetails.findIndex(
          (batch) => batch.batchId === batchId
        );

        // Remove the selected batch from the product's batchDetails
        productData.batchDetails.splice(batchIndex, 1);

        // Update the product document in Firestore with the updated batch details
        await productRef.update({
          batchDetails: productData.batchDetails,
          totalQuantity: productData.batchDetails.reduce(
            (sum, batch) => sum + batch.quantity,
            0
          ),
        });
      }

      // Close the modal
      handleCloseModal();
    } catch (error) {
      console.error("Error removing selected batches:", error);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "20px",
        background: "#fff",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
      }}
    >
      <h2>Expired Products</h2>
      <ul>
        {products.map((product) => (
          <li key={product.productId}>
            <h3>Product ID: {product.productId}</h3>
            <p>Product Name: {product.productName}</p>
            <p>Total Quantity: {product.totalQuantity}</p>
            <ul>
              {product.batchDetails.map((batch) => (
                <li key={batch.batchId}>
                  {/* Add checkbox for batch selection */}
                  <input
                    type="checkbox"
                    checked={selectedBatches.some(
                      (b) =>
                        b.productId === product.productId &&
                        b.batchId === batch.batchId
                    )}
                    onChange={(e) =>
                      handleBatchSelection(
                        product.productId,
                        batch.batchId,
                        e.target.checked
                      )
                    }
                  />
                  <p>{`Batch ${batch.batchId}`}</p>
                  {batch.expiryDate && (
                    <p>
                      Expiry Date:{" "}
                      {batch.expiryDate.toDate().toLocaleDateString()}
                    </p>
                  )}
                  <p>Quantity: {batch.quantity}</p>
                  <p>Cost Price: ${batch.costPrice}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <button style={{ marginRight: "10px" }} onClick={handleConfirmModal}>
          Confirm
        </button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
