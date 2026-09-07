<?php

namespace App\Generators;

use App\DTOs\CreateUserDTO;
use App\DTOs\DestroyItemsDTO;
use App\DTOs\IndexProjectDTO;
use App\DTOs\IndexUserDTO;
use App\DTOs\UpdateUserDTO;
use App\Http\Requests\DestroyItemsRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\ValidateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class DtoGenerator
{
    public function generateIndexUserDto(Request $request): IndexUserDTO
    {
        return new IndexUserDTO(
            $request->name,
            $request->email,
            $request->title,
            $request->status,
            $request->created_at,
            $request->input('search'),
        );
    }


    public function generateCreateUserDto(
        ValidateUserRequest $request
    ): CreateUserDTO {

        $data = $request->validated();

        /*
         * Hash password before passing data to DTO.
         */
        $data['password'] = Hash::make(
            $data['password']
        );


        /*
         * Store uploaded profile photo.
         *
         * Database value:
         *
         * images/example.jpg
         *
         * NOT a full URL.
         */
        if ($request->hasFile('photo_path')) {

            $photoPath = $request
                ->file('photo_path')
                ->store('images', 'public');

            $data['photo_path'] = $photoPath;
        }


        /*
         * Creator.
         */
        $data['created_by'] = Auth::id();


        /*
         * DTO receives the complete validated data.
         *
         * This includes:
         *
         * role
         * permissions
         * name
         * email
         * ...
         */
        return new CreateUserDTO($data);
    }


    public function generateUpdateUserDto(
        UpdateUserRequest $request
    ): UpdateUserDTO {

        $data = $request->validated();


        /*
         * Only hash password if a new password
         * was actually provided.
         */
        if (!empty($data['password'])) {

            $data['password'] = Hash::make(
                $data['password']
            );

        } else {

            unset($data['password']);
        }


        /*
         * Store new profile photo if provided.
         *
         * Existing photo_path remains untouched
         * if no new photo is uploaded.
         */
        if ($request->hasFile('photo_path')) {

            $photoPath = $request
                ->file('photo_path')
                ->store('images', 'public');

            $data['photo_path'] = $photoPath;
        }


        /*
         * Updater.
         */
        $data['updated_by'] = Auth::id();


        /*
         * DTO receives all validated data.
         */
        return new UpdateUserDTO($data);
    }


    public function generateDestroyItemsDto(
        DestroyItemsRequest $request
    ): DestroyItemsDTO {

        return new DestroyItemsDTO(
            $request->input('ids')
        );
    }


    public function generateIndexProjectDto(
        Request $request
    ): IndexProjectDTO {

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