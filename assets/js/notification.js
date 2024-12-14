import {host} from './constant.js';

$(document).ready(function () {
    $('#notificationForm').on('submit', function (e) {
        e.preventDefault();
        const title = $('#title').val();
        const body = $('#body').val();
        const scheduleTime = $('#scheduleTime').val();
        const isTest = $('#testNotification').is(':checked');

        const sendTime = isTest
            ? new Date(new Date().getTime() + 30).toISOString()
            : new Date(new Date(scheduleTime).getTime()).toISOString();
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

        const endpoint = `${host}/push-notification/schedule?sendTime=${encodeURIComponent(sendTime)}`;
        $.post(endpoint, payload, function (response) {
            alert('Notification scheduled successfully!');
        }).fail(function () {
            alert('Failed to schedule notification.');
        });
    });
});
