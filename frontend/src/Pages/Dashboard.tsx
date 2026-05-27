import { createClient } from "@/lib/client";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "@/config";

const supabase = createClient();
export default function Dashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<null | User>(null);

  useEffect(() => {
    async function getUserInfo() {
      const { data, error } = await supabase.auth.getUser();
      if (data.user) {
        setUsers(data.user);
      }
    }
    getUserInfo();
  }, []);

  useEffect(() => {
    async function getExistingConversation() {
      if (users) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const jwt = session?.access_token;
        const response = await axios.get(`${BACKEND_URL}/conversations`, {
          headers: {
            Authorization: jwt,
          },
        });
        console.log(`${jwt} Hi there`);
      }
    }
    getExistingConversation();
  }, [users]);

  return (
    <div>
      {!users && <button onClick={() => navigate("/auth")}>Sign in</button>}

      {users && (
        <div>
          {users?.email}
          <br />
          <br />
          <button
            onClick={() => {
              supabase.auth.signOut();
              setUsers(null);
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
