import { HOST } from './constant.js';

$(document).ready(function () {
    $('#notificationForm').on('submit', function (e) {
        e.preventDefault();
        const title = $('#title').val();
        const body = $('#body').val();
        const scheduleTime = $('#scheduleTime').val();
        const isTest = $('#testNotification').is(':checked');

        const formatDate = (date) => {
            const pad = (num) => (num < 10 ? '0' + num : num);
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };


        let sendTime;
        if (isTest) {
            sendTime = new Date(new Date().getTime() + 10 * 1000);
        } else {
            sendTime = new Date(scheduleTime);
        }

        sendTime.setHours(sendTime.getHours() - 7);
        const formattedSendTime = formatDate(sendTime);
        console.log(formattedSendTime);

        if (!isTest && !scheduleTime) {
            alert('Please provide a valid schedule time.');
            return;
        }

        const payload = { 
            title, 
            data: {}, 
            body, 
            token: ''
        };

        const endpoint = `${HOST}/push-notification/schedule?sendTime=${encodeURIComponent(formattedSendTime)}`;
        
        $.ajax({
            url: endpoint,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (response) {
                alert('Notification scheduled successfully!');
            },
            error: function () {
                alert('Failed to schedule notification.');
            }
        });
    });
});
