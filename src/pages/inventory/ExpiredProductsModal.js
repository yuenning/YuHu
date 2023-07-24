import React, { useState } from "react";
import { projectFirestore } from "../../firebase/config";
import { useAuthContext } from "../../hooks/useAuthContext";

export default function ExpiredProductsModal({ products, onClose }) {
  const { user } = useAuthContext();
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [processing, setProcessing] = useState(false);

  const handleCloseModal = () => {
    onClose();
  };

  const handleBatchSelection = (
    productId,
    batchId,
    { selected, expiryDate, quantity }
  ) => {
    if (selected) {
      setSelectedBatches((prevSelected) => [
        ...prevSelected,
        { productId, batchId, expiryDate, quantity },
      ]);
    } else {
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
      setProcessing(true);

      for (const selectedBatch of selectedBatches) {
        const productId = selectedBatch.productId;
        const batchId = selectedBatch.batchId;
        const expiryDate = selectedBatch.expiryDate;
        const quantity = selectedBatch.quantity;

        const productRef = projectFirestore
          .collection(`users/${user.uid}/products`)
          .doc(productId);

        const productDoc = await productRef.get();
        const productData = productDoc.data();

        const batchIndex = productData.batchDetails.findIndex(
          (batch) => batch.batchId === batchId
        );

        productData.batchDetails.splice(batchIndex, 1);

        await productRef.update({
          batchDetails: productData.batchDetails,
          totalQuantity: productData.batchDetails.reduce(
            (sum, batch) => sum + batch.quantity,
            0
          ),
        });

        const dateOfDeletion = new Date();
        await projectFirestore
          .collection(`users/${user.uid}/expiredclearance`)
          .doc(`${productId} -- ${batchId}`)
          .set({
            productId,
            productName: productData.productName,
            batchId,
            expiryDate,
            quantity,
            dateOfDeletion,
          });
      }

      handleCloseModal();
    } catch (error) {
      console.error("Error removing selected batches:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        justifyContent: "center",
        alignItems: "center",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "30px",
        background: "#fff",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        width: "50%",
        maxHeight: "80%",
        overflowY: "auto",
      }}
    >
      <h2>Expired Products</h2>
      <br></br>
      <ul>
        {products.map((product) => (
          <li key={product.productId}>
            <h3>
              Product ID: {product.productId} | Product Name:{" "}
              {product.productName}
            </h3>

            <ul>
              {product.batchDetails.map((batch) => (
                <li
                  key={batch.batchId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedBatches.some(
                      (b) =>
                        b.productId === product.productId &&
                        b.batchId === batch.batchId
                    )}
                    onChange={(e) =>
                      handleBatchSelection(product.productId, batch.batchId, {
                        selected: e.target.checked,
                        expiryDate: batch.expiryDate,
                        quantity: batch.quantity,
                      })
                    }
                  />
                  <div style={{ marginLeft: "10px" }}>
                    <p>{`Batch ${batch.batchId}`} </p>
                    {batch.expiryDate && (
                      <p>
                        Expiry Date:{" "}
                        {batch.expiryDate.toDate().toLocaleDateString()}
                      </p>
                    )}
                    <p>Quantity: {batch.quantity} </p>
                    <p>Cost Price: ${batch.costPrice}</p>
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
      >
        <button
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            marginRight: "10px",
            backgroundColor: "#000000",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "100%",
          }}
          onClick={handleConfirmModal}
          disabled={processing}
        >
          {processing ? "Processing..." : "Confirm"}
        </button>
        <button
          style={{
            display: "block",
            width: "100%",
            padding: "10px",
            backgroundColor: "#000000",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "100%",
          }}
          onClick={onClose}
          disabled={processing}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
