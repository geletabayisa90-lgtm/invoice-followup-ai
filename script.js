const form = document.getElementById("reminderForm");
const resultSection = document.getElementById("resultSection");
const reminderOutput = document.getElementById("reminderOutput");
const copyButton = document.getElementById("copyButton");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const businessName = document.getElementById("businessName").value.trim();
    const customerName = document.getElementById("customerName").value.trim();
    const invoiceNumber = document.getElementById("invoiceNumber").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const dueDateValue = document.getElementById("dueDate").value;
    const tone = document.getElementById("tone").value;
    const paymentLink = document.getElementById("paymentLink").value.trim();
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

    let subject;
    let message;

    if (tone === "friendly") {
        subject = `Friendly Reminder for Invoice ${invoiceNumber}`;
        message = `This is a friendly reminder that invoice ${invoiceNumber} for ${formattedAmount} was due on ${formattedDueDate}.

Please send payment at your earliest convenience. If you have already paid this invoice, please disregard this message.`;
    } else if (tone === "firm") {
        subject = `Payment Required for Overdue Invoice ${invoiceNumber}`;
        message = `Our records show that invoice ${invoiceNumber} for ${formattedAmount}, due on ${formattedDueDate}, remains unpaid.

Please arrange payment promptly or contact us by email if there is an issue with this invoice.`;
    } else {
        subject = `Final Notice for Invoice ${invoiceNumber}`;
        message = `This is a final notice regarding invoice ${invoiceNumber} for ${formattedAmount}, which was due on ${formattedDueDate}.

Please submit payment immediately to prevent further collection action. If payment has already been made, please send confirmation.`;
    }
    if (paymentLink) {
        message += `\n\nPay securely here: ${paymentLink}`;
    }
    const reminder = `Subject: ${subject}

Hello ${customerName},

${message}

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