// Mock data cho Memory Vault - đủ 12 tháng (mỗi tháng ít nhất 1 tin)
// Quy ước date: "DD Tháng M" (M là số 1..12)
const mockMessages = [
  // Tháng 12
  {
    id: 1,
    date: "24 Tháng 12",
    title: "Đông về ấm áp",
    content: "Trời lạnh hơn rồi, em nhớ mặc ấm nhé. Anh không ở gần nhưng lúc nào cũng lo cho em.",
    time: "21:10 PM",
    isFavorite: true,
    bgColor: "pink",
    fullContent: "Trời lạnh hơn rồi, em nhớ mặc ấm nhé. Anh không ở gần nhưng lúc nào cũng lo cho em. Ước gì có thể nắm tay em lúc này để truyền cho em chút ấm áp."
  },
  // Tháng 11
  {
    id: 2,
    date: "15 Tháng 11",
    title: "Một ngày bận rộn",
    content: "Hôm nay anh bận nhưng vẫn muốn nhắn cho em một câu: em là điều anh nghĩ đến nhiều nhất.",
    time: "23:05 PM",
    isFavorite: false,
    bgColor: "beige",
    fullContent: "Hôm nay anh bận nhưng vẫn muốn nhắn cho em một câu: em là điều anh nghĩ đến nhiều nhất. Dù chỉ vài phút thôi, anh vẫn muốn dành nó để nhớ về em."
  },
  // Tháng 10
  {
    id: 3,
    date: "24 Tháng 10",
    title: "Gió lạnh đầu mùa",
    content: "Hôm nay anh nhớ nụ cười của em nhiều lắm. Ở đây gió lạnh, nhưng nghĩ về em làm anh thấy ấm lòng.",
    time: "22:04 PM",
    isFavorite: true,
    bgColor: "pink",
    fullContent: "Hôm nay anh nhớ nụ cười của em nhiều lắm. Ở đây gió lạnh, nhưng nghĩ về em làm anh thấy ấm lòng. Mong em giữ ấm nhé. Mỗi khi nhớ em, anh lại tự nhủ rằng khoảng cách này chỉ là tạm thời thôi."
  },
  // Tháng 9
  {
    id: 4,
    date: "08 Tháng 9",
    title: "Trời thu dịu dàng",
    content: "Tháng 9 đến nhẹ nhàng. Anh mong em cũng được dịu dàng với chính mình như vậy.",
    time: "18:20 PM",
    isFavorite: true,
    bgColor: "beige",
    fullContent: "Tháng 9 đến nhẹ nhàng. Anh mong em cũng được dịu dàng với chính mình như vậy. Nếu mệt thì nghỉ một chút, rồi tiếp tục. Anh luôn ở đây."
  },
  // Tháng 8
  {
    id: 5,
    date: "19 Tháng 8",
    title: "Nắng cuối hạ",
    content: "Nắng vẫn còn rực rỡ. Anh gửi em một chút năng lượng để em cười nhiều hơn hôm nay.",
    time: "09:10 AM",
    isFavorite: false,
    bgColor: "pink",
    fullContent: "Nắng vẫn còn rực rỡ. Anh gửi em một chút năng lượng để em cười nhiều hơn hôm nay. Dù xa, anh vẫn muốn là lý do làm em vui."
  },
  // Tháng 7
  {
    id: 6,
    date: "02 Tháng 7",
    title: "Mưa tháng 7",
    content: "Nếu ngoài kia mưa, em nhớ mang theo áo mưa nhé. Đừng để cảm lạnh.",
    time: "16:45 PM",
    isFavorite: false,
    bgColor: "beige",
    fullContent: "Nếu ngoài kia mưa, em nhớ mang theo áo mưa nhé. Đừng để cảm lạnh. Anh nhớ những lần mình trú mưa cùng nhau."
  },
  // Tháng 6
  {
    id: 7,
    date: "21 Tháng 6",
    title: "Ngày dài, thương nhiều",
    content: "Hôm nay có thể dài và mệt, nhưng em vẫn là điều đẹp nhất trong ngày của anh.",
    time: "20:30 PM",
    isFavorite: true,
    bgColor: "pink",
    fullContent: "Hôm nay có thể dài và mệt, nhưng em vẫn là điều đẹp nhất trong ngày của anh. Chỉ cần nghĩ đến em thôi, anh thấy mọi thứ nhẹ lại."
  },
  // Tháng 5
  {
    id: 8,
    date: "05 Tháng 5",
    title: "Tháng 5 rực rỡ",
    content: "Tháng 5 nắng đẹp. Anh mong em cũng rực rỡ như nắng, tự tin và bình yên.",
    time: "11:15 AM",
    isFavorite: false,
    bgColor: "beige",
    fullContent: "Tháng 5 nắng đẹp. Anh mong em cũng rực rỡ như nắng, tự tin và bình yên. Nếu có chuyện gì buồn, kể anh nghe nhé."
  },
  // Tháng 4
  {
    id: 9,
    date: "14 Tháng 4",
    title: "Một lời hứa nhỏ",
    content: "Anh hứa sẽ cố gắng từng ngày để sớm được ở cạnh em. Chờ anh nhé.",
    time: "22:40 PM",
    isFavorite: true,
    bgColor: "pink",
    fullContent: "Anh hứa sẽ cố gắng từng ngày để sớm được ở cạnh em. Chờ anh nhé. Mình sẽ lại cùng nhau đi dạo, ăn món em thích và kể nhau nghe mọi chuyện."
  },
  // Tháng 3
  {
    id: 10,
    date: "09 Tháng 3",
    title: "Trời có chút gió",
    content: "Gió tháng 3 làm anh nhớ mùi tóc em. Nhớ em nhiều.",
    time: "07:05 AM",
    isFavorite: false,
    bgColor: "beige",
    fullContent: "Gió tháng 3 làm anh nhớ mùi tóc em. Nhớ em nhiều. Anh chỉ muốn nói là anh thương em, và anh sẽ luôn thương em như vậy."
  },
  // Tháng 2
  {
    id: 11,
    date: "18 Tháng 2",
    title: "Sau Tết bình yên",
    content: "Tết qua rồi, nhưng tình yêu anh dành cho em thì không qua đâu. Luôn ở đây.",
    time: "19:00 PM",
    isFavorite: true,
    bgColor: "pink",
    fullContent: "Tết qua rồi, nhưng tình yêu anh dành cho em thì không qua đâu. Luôn ở đây. Mong em một năm mới nhiều niềm vui, ít áp lực và luôn khỏe mạnh."
  },
  // Tháng 1
  {
    id: 12,
    date: "03 Tháng 1",
    title: "Năm mới, yêu mới",
    content: "Năm mới bắt đầu rồi. Anh chỉ mong mình cùng nhau đi qua tất cả, bằng yêu thương và kiên nhẫn.",
    time: "08:10 AM",
    isFavorite: false,
    bgColor: "beige",
    fullContent: "Năm mới bắt đầu rồi. Anh chỉ mong mình cùng nhau đi qua tất cả, bằng yêu thương và kiên nhẫn. Cảm ơn em vì đã ở đây, cùng anh."
  },
];

// Hàm để lấy tin nhắn theo tháng
function getMessagesByMonth(month) {
  // month format: "10", "9", "8", etc.
  return mockMessages.filter(msg => {
    // Extract month number from "24 Tháng 10" -> "10"
    const dateParts = msg.date.split(' ');
    const msgMonth = dateParts[dateParts.length - 1]; // Lấy số tháng cuối cùng
    return msgMonth === month;
  });
}

// Hàm để lấy tin nhắn mới nhất
function getLatestMessage() {
  return mockMessages[0]; // Tin nhắn đầu tiên là mới nhất
}

// Hàm để lấy tin nhắn theo ID
function getMessageById(id) {
  return mockMessages.find(msg => msg.id === id);
}

// Export để sử dụng trong các file khác
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    mockMessages,
    getMessagesByMonth,
    getLatestMessage,
    getMessageById
  };
}

