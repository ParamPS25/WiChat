export default function formatMessageTime(dateStr) {
    const date = new Date(dateStr);

    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-IN', { month: 'short' }); // Jun
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month}, ${hour}:${minute}`;
}
