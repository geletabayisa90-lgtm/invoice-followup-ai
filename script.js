const form = document.getElementById("reminderForm");
const resultSection = document.getElementById("resultSection");
const reminderOutput = document.getElementById("reminderOutput");
const copyButton = document.getElementById("copyButton");
const emailButton = document.getElementById("emailButton");
const saveButton = document.getElementById("saveButton");
const clearHistoryButton = document.getElementById(
    "clearHistoryButton"
);
const emptyHistoryMessage = document.getElementById(
    "emptyHistoryMessage"
);
const historyList = document.getElementById("historyList");

let emailRecipient = "";
let emailSubject = "";
let currentReminder = null;

function getSavedReminders() {
    try {
        const savedData = localStorage.getItem(
            "invoiceReminderHistory"
        );

        return savedData ? JSON.parse(savedData) : [];
    } catch {
        return [];
    }
}

function storeSavedReminders(reminders) {
    localStorage.setItem(
        "invoiceReminderHistory",
        JSON.stringify(reminders)
    );
}

function getEditedReminder() {
    const fullText = reminderOutput.value.trim();

    if (!fullText) {
        return {
            fullText: "",
            subject: emailSubject,
            body: ""
        };
    }

    const lines = fullText.split("\n");
    const firstLine = lines[0].trim();

    let subject = emailSubject;
    let body = fullText;

    if (firstLine.toLowerCase().startsWith("subject:")) {
        const editedSubject = firstLine
            .slice("subject:".length)
            .trim();

        if (editedSubject) {
            subject = editedSubject;
        }

        body = lines.slice(1).join("\n").trim();
    }

    return {
        fullText,
        subject,
        body
    };
}

function renderHistory() {
    const reminders = getSavedReminders();

    historyList.innerHTML = "";
    emptyHistoryMessage.hidden = reminders.length > 0;
    clearHistoryButton.hidden = reminders.length === 0;

    reminders.forEach(function (reminder, index) {
        const item = document.createElement("article");
        item.className = "history-item";

        const title = document.createElement("h3");
        title.textContent =
            `${reminder.invoiceNumber} — ` +
            `${reminder.customerName}`;

        const amount = document.createElement("p");
        amount.textContent =
            `Amount: ${reminder.formattedAmount}`;

        const status = document.createElement("p");
        status.textContent =
            `Status: ${reminder.overdueStatus}`;

        const savedDate = document.createElement("p");
        savedDate.textContent =
            `Saved: ${reminder.savedAt}`;

        const actions = document.createElement("div");
        actions.className = "history-actions";

        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.textContent = "Open";

        openButton.addEventListener("click", function () {
            if (!reminder.reminderText) {
                alert(
                    "This older saved reminder does not contain a message."
                );
                return;
            }

            currentReminder = reminder;
            emailRecipient = reminder.customerEmail || "";

            const firstLine =
                reminder.reminderText.split("\n")[0];

            emailSubject = firstLine
                .replace(/^Subject:\s*/i, "")
                .trim();

            reminderOutput.value =
                reminder.reminderText;

            resultSection.hidden = false;
            saveButton.textContent = "Save Reminder";

            resultSection.scrollIntoView({
                behavior: "smooth"
            });
        });

        const copyHistoryButton =
            document.createElement("button");

        copyHistoryButton.type = "button";
        copyHistoryButton.textContent = "Copy";

        copyHistoryButton.addEventListener(
            "click",
            async function () {
                if (!reminder.reminderText) {
                    alert(
                        "This older saved reminder does not contain a message."
                    );
                    return;
                }

                try {
                    await navigator.clipboard.writeText(
                        reminder.reminderText
                    );

                    copyHistoryButton.textContent =
                        "Copied!";

                    setTimeout(function () {
                        copyHistoryButton.textContent =
                            "Copy";
                    }, 2000);
                } catch {
                    copyHistoryButton.textContent =
                        "Copy failed";
                }
            }
        );

        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className =
            "delete-history-button";

        deleteButton.addEventListener(
            "click",
            function () {
                const confirmed = window.confirm(
                    `Delete the saved reminder for ${reminder.customerName}?`
                );

                if (!confirmed) {
                    return;
                }

                const updatedReminders =
                    getSavedReminders();

                updatedReminders.splice(index, 1);
                storeSavedReminders(updatedReminders);
                renderHistory();
            }
        );

        actions.appendChild(openButton);
        actions.appendChild(copyHistoryButton);
        actions.appendChild(deleteButton);

        item.appendChild(title);
        item.appendChild(amount);
        item.appendChild(status);
        item.appendChild(savedDate);
        item.appendChild(actions);

        historyList.appendChild(item);
    });
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const businessName = document
        .getElementById("businessName")
        .value.trim();

    const customerName = document
        .getElementById("customerName")
        .value.trim();

    const customerEmail = document
        .getElementById("customerEmail")
        .value.trim();

    const invoiceNumber = document
        .getElementById("invoiceNumber")
        .value.trim();

    const amount = Number(
        document.getElementById("amount").value
    );

    const dueDateValue = document
        .getElementById("dueDate")
        .value;

    const paymentLink = document
        .getElementById("paymentLink")
        .value.trim();

    const tone = document
        .getElementById("tone")
        .value;

    const dueDate = new Date(
        `${dueDateValue}T00:00:00`
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    const daysOverdue = Math.floor(
        (today - dueDate) / millisecondsPerDay
    );

    if (daysOverdue < 0) {
        alert(
            "The due date is in the future. Please select today or a past date."
        );
        return;
    }

    const overdueStatus =
        daysOverdue === 0
            ? "Due today"
            : `${daysOverdue} ${
                  daysOverdue === 1
                      ? "day"
                      : "days"
              } overdue`;

    const formattedDueDate =
        dueDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    const formattedAmount =
        amount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });

    let subject = "";
    let message = "";

    if (tone === "friendly") {
        subject =
            `Friendly Reminder for Invoice ${invoiceNumber}`;

        message = [
            `This is a friendly reminder that invoice ${invoiceNumber} for ${formattedAmount} was due on ${formattedDueDate}.`,
            "Please send payment at your earliest convenience. If you have already paid this invoice, please disregard this message."
        ].join("\n\n");
    } else if (tone === "firm") {
        subject =
            `Payment Required for Overdue Invoice ${invoiceNumber}`;

        message = [
            `Our records show that invoice ${invoiceNumber} for ${formattedAmount}, due on ${formattedDueDate}, remains unpaid.`,
            "Please arrange payment promptly or contact us by email if there is an issue with this invoice."
        ].join("\n\n");
    } else {
        subject =
            `Final Notice for Invoice ${invoiceNumber}`;

        message = [
            `This is a final notice regarding invoice ${invoiceNumber} for ${formattedAmount}, which was due on ${formattedDueDate}.`,
            "Please submit payment immediately to prevent further collection action. If payment has already been made, please send confirmation."
        ].join("\n\n");
    }

    if (paymentLink) {
        message +=
            `\n\nPay securely here: ${paymentLink}`;
    }

    const body = [
        `Hello ${customerName},`,
        `Invoice status: ${overdueStatus}`,
        message,
        `Thank you,\n${businessName}`
    ].join("\n\n");

    const reminderText = [
        `Subject: ${subject}`,
        body
    ].join("\n\n");

    emailRecipient = customerEmail;
    emailSubject = subject;

    currentReminder = {
        invoiceNumber,
        customerName,
        customerEmail,
        formattedAmount,
        overdueStatus,
        reminderText,
        savedAt: new Date().toLocaleString("en-US")
    };

    reminderOutput.value = reminderText;
    resultSection.hidden = false;
    saveButton.textContent = "Save Reminder";

    resultSection.scrollIntoView({
        behavior: "smooth"
    });
});

reminderOutput.addEventListener("input", function () {
    if (currentReminder) {
        saveButton.textContent = "Save Reminder";
    }
});

copyButton.addEventListener(
    "click",
    async function () {
        const editedReminder = getEditedReminder();

        if (!editedReminder.fullText) {
            alert(
                "Please generate a reminder first."
            );
            return;
        }

        try {
            await navigator.clipboard.writeText(
                editedReminder.fullText
            );

            copyButton.textContent = "Copied!";

            setTimeout(function () {
                copyButton.textContent =
                    "Copy Message";
            }, 2000);
        } catch {
            copyButton.textContent =
                "Copy failed";
        }
    }
);

emailButton.addEventListener(
    "click",
    function () {
        const editedReminder = getEditedReminder();

        if (!emailRecipient) {
            alert(
                "This reminder does not have a customer email address. Generate a new reminder with an email address."
            );
            return;
        }

        if (
            !editedReminder.subject ||
            !editedReminder.body
        ) {
            alert(
                "Please generate a reminder first."
            );
            return;
        }

        const emailLink =
            `mailto:${encodeURIComponent(emailRecipient)}` +
            `?subject=${encodeURIComponent(
                editedReminder.subject
            )}` +
            `&body=${encodeURIComponent(
                editedReminder.body
            )}`;

        window.location.href = emailLink;
    }
);

saveButton.addEventListener(
    "click",
    function () {
        if (!currentReminder) {
            alert(
                "Please generate a reminder first."
            );
            return;
        }

        const editedReminder = getEditedReminder();

        if (!editedReminder.fullText) {
            alert(
                "The reminder cannot be empty."
            );
            return;
        }

        const reminderToSave = {
            ...currentReminder,
            reminderText: editedReminder.fullText,
            savedAt: new Date().toLocaleString("en-US")
        };

        const reminders = getSavedReminders();

        reminders.unshift(reminderToSave);

        storeSavedReminders(
            reminders.slice(0, 25)
        );

        currentReminder = reminderToSave;

        renderHistory();
        saveButton.textContent = "Saved!";
    }
);

clearHistoryButton.addEventListener(
    "click",
    function () {
        const confirmed = window.confirm(
            "Delete all saved reminders from this browser?"
        );

        if (!confirmed) {
            return;
        }

        localStorage.removeItem(
            "invoiceReminderHistory"
        );

        renderHistory();
    }
);

renderHistory();