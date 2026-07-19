const form = document.getElementById("reminderForm");
const resultSection = document.getElementById("resultSection");
const reminderOutput = document.getElementById("reminderOutput");
const copyButton = document.getElementById("copyButton");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const businessName = document.getElementById("businessName").value;
    const customerName = document.getElementById("customerName").value;
    const invoiceNumber = document.getElementById("invoiceNumber").value;
    const amount = Number(document.getElementById("amount").value);
    const dueDateValue = document.getElementById("dueDate").value;

    const dueDate = new Date(`${dueDateValue}T00:00:00`);
    const formattedDueDate = dueDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const formattedAmount = amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    });

    const reminder = `Subject: Reminder for Invoice ${invoiceNumber}

Hello ${customerName},

This is a friendly reminder that invoice ${invoiceNumber} for ${formattedAmount} was due on ${formattedDueDate}.

Please send payment at your earliest convenience. If you have already paid this invoice, please disregard this message.

Thank you,
${businessName}`;

    reminderOutput.textContent = reminder;
    resultSection.hidden = false;
    resultSection.scrollIntoView({ behavior: "smooth" });
});

copyButton.addEventListener("click", async function () {
    try {
        await navigator.clipboard.writeText(reminderOutput.textContent);
        copyButton.textContent = "Copied!";

        setTimeout(function () {
            copyButton.textContent = "Copy Message";
        }, 2000);
    } catch {
        copyButton.textContent = "Copy failed";
    }
});