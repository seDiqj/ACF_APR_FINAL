<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;



class NotificationController extends Controller
{
    public function indexUserNotifications (string $id)
    {
        $user = User::find($id);

        if (!$user) return response()->json(["status" => false, "message" => "No such user in system !"]);

        $notifications = $user->notifications;

        $notifications = $notifications->map(function ($notification) {
            $notification["time"] = \Carbon\Carbon::parse($notification["created_at"])->diffForHumans();
            $notification["timeForSorting"] = \Carbon\Carbon::parse($notification["created_at"]);
            $notification["unread"] = !(bool) $notification->pivot->readAt;

            unset(
                $notification["pivot"],
                $notification["created_at"],
                $notification["updated_at"],
            );
            return $notification;
        });


        return response()->json(["status" => true, "message" => "", "data" => $notifications], 200);
    }

    public function markNotificationAsRead (string $id)
    {
        $user = Auth::user();

        $user->notifications()->updateExistingPivot($id, [
            "readAt" => true
        ]);

        return response()->noContent();
    }
}