import { useState, useEffect } from "react";
import { projectFirestore } from "../../firebase/config";
import { useAuthContext } from "../../hooks/useAuthContext";

// Styles
import { FaTimes } from "react-icons/fa";

export default function SalesForm() {
  const { user } = useAuthContext();
  const [transactionForms, setTransactionForms] = useState({
    date: "",
    time: "",
    transactionID: "",
    transactionAmount: 0,
  });
  const [productForms, setProductForms] = useState([
    {
      productId: "",
      productName: "",
      sellingPrice: "",
      quantity: "",
    },
  ]);

  useEffect(() => {
    // Calculate and update the transaction amount when product forms change
    let totalAmount = 0;
    productForms.forEach((form) => {
      const quantity = parseFloat(form.quantity);
      const sellingPrice = parseFloat(form.sellingPrice);
      if (!isNaN(quantity) && !isNaN(sellingPrice)) {
        totalAmount += quantity * sellingPrice;
      }
    });
    setTransactionForms((prevTransactionForms) => ({
      ...prevTransactionForms,
      transactionAmount: totalAmount,
    }));
  }, [productForms]);

  const handleTransactionChange = (field, value) => {
    setTransactionForms({ ...transactionForms, [field]: value });
  };

  const handleProductChange = async (index, field, value) => {
    const updatedForms = [...productForms];
    updatedForms[index] = {
      ...updatedForms[index],
      [field]: value,
    };

    if (field === "productId") {
      const productId = value;

      // Fetch the selling price and transaction ID from salesitems collection
      const salesItemsSnapshot = await projectFirestore
        .collection(`users/${user.uid}/salesitems`)
        .where("productId", "==", productId)
        .orderBy("transactionID", "desc")
        .limit(1)
        .get();

      if (!salesItemsSnapshot.empty) {
        const salesItemData = salesItemsSnapshot.docs[0].data();
        const sellingPrice = salesItemData.sellingPrice || "";
        const productName = salesItemData.productName || "";

        const transactionID = salesItemData.transactionID;
        const salesSnapshot = await projectFirestore
          .collection(`users/${user.uid}/sales`)
          .where("transactionID", "==", transactionID)
          .limit(1)
          .get();

        if (!salesSnapshot.empty) {
          const salesData = salesSnapshot.docs[0].data();
          const latestTransactionID = salesData.transactionID;

          const latestSalesItemsSnapshot = await projectFirestore
            .collection(`users/${user.uid}/salesitems`)
            .where("transactionID", "==", latestTransactionID)
            .where("productId", "==", productId)
            .limit(1)
            .get();

          if (!latestSalesItemsSnapshot.empty) {
            const latestSalesItemData = latestSalesItemsSnapshot.docs[0].data();
            const latestSellingPrice = latestSalesItemData.sellingPrice || "";
            updatedForms[index].sellingPrice = latestSellingPrice;
          }
        }

        updatedForms[index].sellingPrice = sellingPrice;
        updatedForms[index].productName = productName;
      }
    }

    setProductForms(updatedForms);
  };

  const addProductForm = () => {
    setProductForms([
      ...productForms,
      {
        productId: "",
        productName: "",
        sellingPrice: "",
        quantity: "",
      },
    ]);
  };

  const removeProductForm = (index) => {
    const updatedForms = [...productForms];
    updatedForms.splice(index, 1);
    setProductForms(updatedForms);
  };

  const handleSubmit = async () => {
    // Check if all products exist and have sufficient quantity
    const productsExist = await Promise.all(
      productForms.map(async (form) => {
        console.log("Product Forms:", productForms);
        console.log("Query Parameters:", {
          collection: `users/${user.uid}/products`,
          productId: form.productId,
        });

        const querySnapshot = await projectFirestore
          .collection(`users/${user.uid}/products`)
          .where("productId", "==", `${form.productId}`)
          .get();

        if (querySnapshot.empty) {
          console.log(form.productId + " does not exist");
          return false;
        }

        const productData = querySnapshot.docs[0].data();
        const totalQuantity = productData.totalQuantity;

        if (parseInt(totalQuantity) < parseInt(form.quantity)) {
          console.log(form.productId + " does not have sufficient quantity");
          return false;
        }

        return true;
      })
    );

    if (!productsExist.every((exist) => exist)) {
      alert(
        "One or more products do not exist or have insufficient quantity. Submission rejected."
      );
      return;
    }

    // Save transaction forms to Firebase
    await projectFirestore
      .collection(`users/${user.uid}/sales`)
      .add(transactionForms);

    // Get the transaction ID
    const transactionID = transactionForms.transactionID;

    // Update the products collection
    productForms.forEach(async (form) => {
      const { productId, quantity } = form;

      const querySnapshot = await projectFirestore
        .collection(`users/${user.uid}/products`)
        .where("productId", "==", `${productId}`)
        .get();

      const productDocRef = querySnapshot.docs[0].ref;

      const productData = querySnapshot.docs[0].data();
      const batchDetails = productData.batchDetails || [];

      // Sort the batchDetails array based on expiryDate in ascending order
      batchDetails.sort(
        (a, b) => new Date(b.expiryDate) - new Date(a.expiryDate)
      );

      let remainingQuantity = quantity;

      for (const batch of batchDetails) {
        if (remainingQuantity <= 0) {
          break;
        }

        if (batch.quantity <= remainingQuantity) {
          remainingQuantity -= batch.quantity;
          batch.quantity = 0;
        } else {
          batch.quantity -= remainingQuantity;
          remainingQuantity = 0;
        }
      }

      // Remove batches with quantity 0
      const updatedBatchDetails = batchDetails.filter(
        (batch) => batch.quantity > 0
      );

      await productDocRef.update({
        batchDetails: updatedBatchDetails,
        totalQuantity: updatedBatchDetails.reduce(
          (sum, batch) => parseInt(sum) + parseInt(batch.quantity),
          0
        ),
      });

      form.transactionID = transactionID;
      projectFirestore.collection(`users/${user.uid}/salesitems`).add(form);
    });

    // Reset forms after submission
    setTransactionForms({
      date: "",
      time: "",
      transactionID: "",
      transactionAmount: 0,
    });
    setProductForms([
      {
        productId: "",
        productName: "",
        sellingPrice: "",
        quantity: "",
      },
    ]);

    // Display success message
    const totalAmount = parseFloat(transactionForms.transactionAmount);
    if (!isNaN(totalAmount)) {
      alert(
        `Successfully recorded!\nSales Transaction ID: ${transactionID}\nTotal Amount: ${totalAmount}`
      );
    }
  };

  return (
    <div>
      {/* Transaction Form */}
      <h3 style={{ display: "flex", alignItems: "center" }}>Sales Transaction Details</h3>
      <div style={{ paddingBottom: "20px" }}>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ width: "45%" }}>
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          value={transactionForms.date}
          onChange={(e) => handleTransactionChange("date", e.target.value)}
        />
      </div>
      <div style={{ width: "45%" }}>
        <label htmlFor="time">Time:</label>
        <input
          type="time"
          id="time"
          value={transactionForms.time}
          onChange={(e) => handleTransactionChange("time", e.target.value)}
        />
      </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ width: "45%" }}>
        <label htmlFor="transactionId">Transaction ID:</label>
        <input
          type="text"
          id="transactionId"
          value={transactionForms.transactionID}
          onChange={(e) =>
            handleTransactionChange("transactionID", e.target.value)
          }
        />
      </div>
      {/* Transaction Amount */}
      <div style={{ width: "45%" }}>
        <label htmlFor="transactionAmount">
          Total Transaction Amount: ${transactionForms.transactionAmount}
        </label>
      </div>
      </div>
      </form>
      </div>

      {/* Product Forms */}
      {productForms.map((form, index) => (
        <div key={index}>
          <br></br>
          <h3 style={{ display: "flex", alignItems: "center" }}>Sales Product {index + 1} Details
          {/* Remove Product Form Button */}
          {index > 0 && (
            <button
              type="button"
              onClick={() => removeProductForm(index)}
              style={{
                background: "none",
                color: "#777",
                border: "2px solid black",
                padding: "2px",
                marginLeft: "10px",
                textAlign: "center",
                lineHeight: "1",
                fontSize: "0.9em",
                cursor: "pointer",
                width: "30px",
                height: "30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <FaTimes
                style={{
                  margin: "0",
                  color: "black",
                  fontSize: "1.2em",
                }}
              />
            </button>
          )}
          </h3>
          <div style={{ paddingBottom: "20px" }}>
          <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
          >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: "45%" }}>
            <label htmlFor={`productId${index}`}>Product ID:</label>
            <input
              type="text"
              id={`productId${index}`}
              value={form.productId}
              onChange={(e) =>
                handleProductChange(index, "productId", e.target.value)
              }
            />
          </div>
          <div style={{ width: "45%" }}>
            <label htmlFor={`productName${index}`}>Product Name:</label>
            <input
              type="text"
              id={`productName${index}`}
              value={form.productName}
              onChange={(e) =>
                handleProductChange(index, "productName", e.target.value)
              }
            />
          </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ width: "45%" }}>
            <label htmlFor={`sellingPrice${index}`}>Selling Price:</label>
            <input
              type="number"
              id={`sellingPrice${index}`}
              value={form.sellingPrice}
              onChange={(e) =>
                handleProductChange(index, "sellingPrice", e.target.value)
              }
            />
          </div>
          <div style={{ width: "45%" }}>
            <label htmlFor={`quantity${index}`}>Quantity:</label>
            <input
              type="number"
              id={`quantity${index}`}
              value={form.quantity}
              onChange={(e) =>
                handleProductChange(index, "quantity", e.target.value)
              }
            />
          </div>
          </div>
          </form>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button style= {{ 
            display: 'block', 
            width: '315px', 
            padding: '10px', 
            color: 'black', 
            border: 'none',
            borderRadius: '5px', 
            fontSize: '100%' 
          }} type="button" onClick={addProductForm}>
        <u>+ Add Another Product</u>
      </button>

      {/* Submit Button */}
      <button style={{
            display: "block",
            width: "315px",
            padding: "10px",
            backgroundColor: "#000000",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "100%",
          }} type="button" onClick={handleSubmit}>
        Submit
      </button>
    </div>
    </div>
  );
}
