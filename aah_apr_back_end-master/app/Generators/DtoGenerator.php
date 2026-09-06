<?php

namespace App\Generators;

use App\DTOs\CreateUserDTO;
use App\DTOs\DestroyItemsDTO;
use App\DTOs\IndexProjectDTO;
use App\DTOs\IndexUserDTO;
use App\DTOs\UpdateUserDTO;
use App\Http\Requests\DestroyItemsRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Http\Request;
use App\Http\Requests\ValidateUserRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class DtoGenerator {

    public function generateIndexUserDto (Request $request): IndexUserDTO {

        return new IndexUserDTO(
            $request->name,
            $request->email,
            $request->title,
            $request->status,
            $request->created_at,
            $request->input("search"),
        );

    }

    public function generateCreateUserDto (ValidateUserRequest $request): CreateUserDTO {

        $data = $request->validated();

        $data['password'] = Hash::make($data['password']);

        if ($request->hasFile('photo_path')) {
            $photoPath = $request->file('photo_path')->store('images', 'public');
            $data['photo_path'] = $photoPath;
        }

        $data['created_by'] = Auth::id();

        return new CreateUserDTO($data);

    }

    public function generateUpdateUserDto (UpdateUserRequest $request): UpdateUserDTO {

        $data = $request->validated();

        if ($request->password) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        if ($request->hasFile('photo_path')) {
            $photoPath = $request->file('photo_path')->store('images', 'public');
            $data['photo_path'] = $photoPath; 
        }

        $data['updated_by'] = Auth::id();

        return new UpdateUserDTO($data);

    }

    public function generateDestroyItemsDto (DestroyItemsRequest $request): DestroyItemsDTO {

        return new DestroyItemsDTO($request->input("ids"));

    }

    public function generateIndexProjectDto (Request $request): IndexProjectDTO {

        return new IndexProjectDTO(
            $request->projectManager,
            $request->projectCode,
            $request->startDate,
            $request->endDate,
            $request->reportingDate,
            $request->status,
            $request->aprStatus,
            $request->projectTitle,
            $request->projectDonor,
            $request->projectGoal,
            $request->search,
        );

    }

}