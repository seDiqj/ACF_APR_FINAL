<?php

namespace App\Http\Controllers;

use App\Constants\System;
use App\Generators\DtoGenerator;
use App\Http\Requests\DestroyItemsRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\ValidateUserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(
        Request $request,
        UserService $service
    ) {
        /*
         * این قسمت را مطابق DTO فعلی index خودت نگه دار.
         *
         * اگر index فعلی Controller تو مستقیماً query می‌زند،
         * بهتر است آن را نیز به DTO + Service منتقل کنیم.
         */
        $query = User::query()->with('updater');


        $query->when(
            $request->filled('name'),
            function ($q) use ($request) {

                $names = $request->input('name');

                if (!is_array($names)) {
                    $names = explode(',', $names);
                }

                $q->whereIn('name', $names);
            }
        );


        $query->when(
            $request->filled('email'),
            function ($q) use ($request) {

                $emails = explode(
                    ',',
                    $request->input('email')
                );

                $q->whereIn('email', $emails);
            }
        );


        $query->when(
            $request->filled('title'),
            function ($q) use ($request) {

                $titles = explode(
                    ',',
                    $request->input('title')
                );

                $q->whereIn('title', $titles);
            }
        );


        $query->when(
            $request->filled('status'),
            function ($q) use ($request) {

                $status = $request->input('status');

                if (!is_array($status)) {
                    $status = explode(',', $status);
                }

                $q->whereIn('status', $status);
            }
        );


        $query->when(
            $request->filled('created_at'),
            function ($q) use ($request) {

                $dates = explode(
                    ',',
                    $request->input('created_at')
                );

                if (count($dates) === 1) {
                    $q->whereDate(
                        'created_at',
                        $dates[0]
                    );
                }
            }
        );


        $query->when(
            $request->filled('search'),
            function ($q) use ($request) {

                $search = $request->input('search');

                $q->where(function ($query) use ($search) {

                    $query
                        ->where(
                            'name',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'email',
                            'like',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'title',
                            'like',
                            "%{$search}%"
                        );
                });
            }
        );


        $perPage = $request->integer(
            'perPage',
            10
        );


        $order = $request->input(
            'order',
            'desc'
        );

        if (!in_array($order, ['asc', 'desc'], true)) {
            $order = 'desc';
        }


        $users = $query
            ->orderBy(
                'created_at',
                $order
            )
            ->paginate($perPage);


        if ($users->isEmpty()) {

            return response()->json([
                'status' => false,

                'message' => 'No user was found!',

                'data' => [],
            ], 200);
        }


        $users
            ->getCollection()
            ->transform(function ($user) {

                $user->updated_by =
                    $user->updater?->name;

                unset($user->updater);


                /*
                 * Keep original photo_path.
                 */
                $user->photo =
                    $user->photo_path
                        ? asset(
                            'storage/' .
                            $user->photo_path
                        )
                        : null;


                return $user;
            });


        return response()->json([
            'status' => true,

            'message' => '',

            'data' => $users,
        ], 200);
    }


    public function store(
        ValidateUserRequest $request,
        DtoGenerator $dtoGenerator,
        UserService $service
    ) {

        $dto =
            $dtoGenerator
                ->generateCreateUserDto($request);


        $user =
            $service->createUser($dto);


        return response()->json([
            'status' => true,

            'message' =>
                'User Created Successfully!',

            'data' => $user,
        ], 201);
    }


    public function show(
        string $id,
        UserService $service
    ) {

        $user =
            $service->showUser($id);


        if ($user === System::SYSTEM_404) {

            return response()->json([
                'status' => false,

                'message' =>
                    'No such user in database!',

                'data' => [],
            ], 404);
        }


        return response()->json([
            'status' => true,

            'message' =>
                'User retrieved successfully',

            'data' => $user,
        ], 200);
    }


    public function update(
        UpdateUserRequest $request,
        string $id,
        DtoGenerator $dtoGenerator,
        UserService $service
    ) {

        $dto =
            $dtoGenerator
                ->generateUpdateUserDto($request);


        $user =
            $service->updateUser(
                $dto,
                $id
            );


        if ($user === System::SYSTEM_404) {

            return response()->json([
                'status' => false,

                'message' =>
                    'No such user in system!',

                'data' => [],
            ], 404);
        }


        return response()->json([
            'status' => true,

            'message' =>
                'User Updated Successfully!',

            'data' => $user,
        ], 200);
    }


    public function destroy(
        DestroyItemsRequest $request,
        DtoGenerator $dtoGenerator,
        UserService $service
    ) {

        $dto =
            $dtoGenerator
                ->generateDestroyItemsDto($request);


        $service->deleteUsers($dto);


        return response()->json([
            'status' => true,

            'message' =>
                'Users successfully deleted!',
        ], 200);
    }


    public function me(
        UserService $service
    ) {

        $id = Auth::id();


        $user =
            $service->showUser($id);


        if ($user === System::SYSTEM_404) {

            return response()->json([
                'status' => false,

                'message' =>
                    'No such user in system',

                'data' => [],
            ], 404);
        }


        return response()->json([
            'status' => true,

            'message' =>
                'User retrieved successfully',

            'data' => $user,
        ], 200);
    }


    public function changeUserPassword(
        Request $request,
        string $id
    ) {

        $request->validate([
            'password' =>
                'required|string|min:6|confirmed',
        ]);


        $user =
            User::findOrFail($id);


        $user->password =
            Hash::make(
                $request->input('password')
            );


        $user->save();


        return response()->json([
            'status' => true,

            'message' =>
                'Password changed successfully!',
        ], 200);
    }


    public function getSystemAndUserPermissions(
        string $id,
        UserService $service
    ) {

        $systemPermissions =
            $service->getSystemPermissions(true);


        $userPermissions =
            $service->getUserPermissions($id);


        if ($userPermissions === System::SYSTEM_404) {

            return response()->json([
                'status' => false,

                'message' =>
                    'No such user in database!',

                'data' => [],
            ], 404);
        }


        $directPermissions =
            $service->getUserDirectPermissions($id);


        return response()->json([
            'status' => true,

            'message' =>
                'Permissions retrieved successfully',

            'data' => [

                /*
                 * All system permissions grouped.
                 */
                'system_permissions' =>
                    $systemPermissions,

                /*
                 * All effective permissions:
                 *
                 * Role + Direct
                 */
                'user_permissions' =>
                    $userPermissions,

                /*
                 * Only direct permissions.
                 */
                'direct_permissions' =>
                    $directPermissions,
            ],
        ], 200);
    }


    public function getAllRolesAndPermissions(
        UserService $service
    ) {

        return response()->json([
            'status' => true,

            'message' => '',

            'data' => [

                'permissions' =>
                    $service
                        ->getSystemPermissions(true),

                'roles' =>
                    $service
                        ->getSystemActiveRoles(),
            ],
        ], 200);
    }
}