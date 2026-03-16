"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";
import { Button, Input, Modal } from "@/components/ui";

type ProfileResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    bio?: string | null;
    avatarUrl?: string | null;
  };
};

export default function ProfilePage() {
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await apiRequest<ProfileResponse>("/api/user/profile", {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        setName(response.data.user.name);
        setEmail(response.data.user.email);
        setBio(response.data.user.bio ?? "");
        setAvatarPreview(response.data.user.avatarUrl ?? null);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Could not load profile");
      }
    }

    void loadProfile();
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await apiRequest<ProfileResponse>("/api/user/profile", {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: JSON.stringify({
          name,
          email,
          bio: bio || null,
          avatarUrl: avatarPreview || null
        })
      });

      updateUser(response.data.user);
      setSuccessModalOpen(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Your Profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Update your personal details and profile image.
        </p>

        <section className="card mt-6 p-5 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="h-24 w-24 overflow-hidden rounded-full border border-slate-300 bg-slate-100">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Profile preview"
                    width={96}
                    height={96}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-500">
                    No Photo
                  </div>
                )}
              </div>
              <div className="w-full sm:w-auto">
                <label htmlFor="avatar" className="mb-1 block text-sm font-medium text-slate-700">
                  Profile Picture
                </label>
                <input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hover:file:bg-brand-100 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="bio" className="mb-1 block text-sm font-medium text-slate-700">
                  Bio
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  className="input resize-none"
                />
              </div>
            </div>

            {errorMessage ? (
              <p className="text-sm font-medium text-red-600">{errorMessage}</p>
            ) : null}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </section>
      </main>
      <Modal
        open={successModalOpen}
        title="Profile Updated"
        onClose={() => setSuccessModalOpen(false)}
      >
        Your profile details were saved successfully.
      </Modal>
    </div>
  );
}
