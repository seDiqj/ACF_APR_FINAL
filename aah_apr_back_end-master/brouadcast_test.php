<?php
use App\Events\MessageSent;
use App\Models\User;

$receiver = User::find(4);
$sender = User::find(1);
$message = "Test message";

broadcast(new MessageSent($receiver, $sender, $message))->toOthers();

error_log("Event broadcasted to chat." . $receiver->id);