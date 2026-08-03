import { Member, User } from "@/types/project"

// Dummy users (all) -> soon to be replaced by database
export const users: User[] = [
  {
    id: "1",
    name: "Sarah Miller",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: "2",
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: "3",
    name: "Michael Chen",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: "4",
    name: "Elena Rodriguez",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: "5",
    name: "William Wright",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "6",
    name: "Jessica Lee",
    avatar: "https://i.pravatar.cc/150?img=9",
  },
  {
    id: "7",
    name: "David Smith",
    avatar: "https://i.pravatar.cc/150?img=12",
  },
  {
    id: "8",
    name: "Aisha Hassan",
    avatar: "https://i.pravatar.cc/150?img=26",
  },
]

// Dummy users (nanti ganti dari API)
// export const projectMembers: User[] = [
//   {
//     id: "1",
//     name: "Sarah Miller",
//     avatar: "https://i.pravatar.cc/150?img=1",
//   },
//   {
//     id: "2",
//     name: "John Doe",
//     avatar: "https://i.pravatar.cc/150?img=2",
//   },
//   {
//     id: "3",
//     name: "Michael Chen",
//     avatar: "https://i.pravatar.cc/150?img=3",
//   },
// ]
// export const projectMembers: Member[] = [
//   {
//     memberId: "member-1",
//     userId: "user-1",
//     name: "Jona Jona",
//     role: "LEADER",
//   },
//   {
//     memberId: "member-2",
//     userId: "user-2",
//     name: "Jane Smith",
//     role: "MEMBER",
//   },
//   {
//     memberId: "member-3",
//     userId: "user-3",
//     name: "Michael Johnson",
//     role: "MEMBER",
//   },
// ];