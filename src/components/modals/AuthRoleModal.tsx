import React, { useState } from 'react';
import { UserCheck, Shield, KeyRound, UserPlus, X, LogIn } from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';
import { DEMO_USERS } from '../../data/seedData';
import { UserRole } from '../../types';

export const AuthRoleModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, switchUserRole } = useEmergenx();
  const [activeTab, setActiveTab] = useState<'roles' | 'login' | 'register' | 'forgot'>('roles');

  // Form states for login/register/forgot
  const [loginEmail, setLoginEmail] = useState('rajesh.btp@karnataka.gov.in');
  const [loginPassword, setLoginPassword] = useState('••••••••••');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRoleSelect = (role: UserRole) => {
    switchUserRole(role);
    setStatusMessage(`Switched active role to ${role.replace('_', ' ').toUpperCase()}`);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('Authenticated successfully via Smart City SSO.');
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('Reset instructions dispatched to registered Department email.');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage('Registration submitted for Traffic Authority supervisor sign-off.');
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="relative w-full max-w-lg bg-white border border-[#E6EAEE] rounded-2xl shadow-2xl overflow-hidden text-[#292D32]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E6EAEE]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF5FB] border border-[#91C4FC] text-[#0A699F] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#292D32]">Authentication & Role Governance</h3>
              <p className="text-xs text-[#858F99] font-mono">EMERGENX Security Access Module</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#858F99] hover:text-[#292D32] p-1.5 rounded-lg hover:bg-[#F5F7F9] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-[#E6EAEE] bg-[#F5F7F9] px-6">
          <button
            onClick={() => {
              setActiveTab('roles');
              setStatusMessage(null);
            }}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'roles'
                ? 'border-[#32B8BF] text-[#0A699F]'
                : 'border-transparent text-[#858F99] hover:text-[#292D32]'
            }`}
          >
            Demo Role Switcher
          </button>
          <button
            onClick={() => {
              setActiveTab('login');
              setStatusMessage(null);
            }}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'login'
                ? 'border-[#32B8BF] text-[#0A699F]'
                : 'border-transparent text-[#858F99] hover:text-[#292D32]'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setStatusMessage(null);
            }}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'register'
                ? 'border-[#32B8BF] text-[#0A699F]'
                : 'border-transparent text-[#858F99] hover:text-[#292D32]'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              setActiveTab('forgot');
              setStatusMessage(null);
            }}
            className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'forgot'
                ? 'border-[#32B8BF] text-[#0A699F]'
                : 'border-transparent text-[#858F99] hover:text-[#292D32]'
            }`}
          >
            Reset Password
          </button>
        </div>

        {/* Status banner */}
        {statusMessage && (
          <div className="mx-6 mt-4 p-3 bg-[#EBFBF7] border border-[#28A66A]/40 text-[#28A66A] rounded-xl text-xs font-medium">
            {statusMessage}
          </div>
        )}

        <div className="p-6">
          {/* TAB 1: Quick Role Switcher */}
          {activeTab === 'roles' && (
            <div className="space-y-3">
              <span className="text-xs text-[#858F99] block mb-1">
                Select an authorized persona to test RBAC capabilities:
              </span>
              <div className="space-y-2">
                {DEMO_USERS.map((user) => {
                  const isSelected = currentUser.id === user.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => handleRoleSelect(user.role)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#EBFBF7] border-[#32B8BF] ring-1 ring-[#32B8BF] shadow-xs'
                          : 'bg-[#F5F7F9] border-[#E6EAEE] hover:bg-white hover:border-[#32B8BF]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-[#32B8BF] text-white' : 'bg-[#E6EAEE] text-[#858F99]'
                          }`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[#292D32]">{user.name}</div>
                          <div className="text-[11px] text-[#858F99]">{user.department}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#0A699F] border border-[#E6EAEE] uppercase font-bold">
                          {user.role.replace('_', ' ')}
                        </span>
                        <div className="text-[10px] text-[#858F99] font-mono mt-0.5">{user.badgeNumber}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Login */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[#858F99] font-semibold block mb-1">Department Email / SSO ID</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] focus:outline-none focus:border-[#32B8BF]"
                />
              </div>

              <div>
                <label className="text-[#858F99] font-semibold block mb-1">Passcode / Cryptographic Token</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] focus:outline-none focus:border-[#32B8BF]"
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-1.5 text-[#858F99] cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[#32B8BF]" />
                  <span>Remember Department Terminal</span>
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-[#0A699F] hover:underline"
                >
                  Forgot credentials?
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#32B8BF] hover:bg-[#28A66A] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Authenticate via SSO
              </button>
            </form>
          )}

          {/* TAB 3: Register */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-[#858F99] font-semibold block mb-1">Official Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Inspector Rajesh Kumar"
                  className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] focus:outline-none focus:border-[#32B8BF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#858F99] font-semibold block mb-1">Service Role</label>
                  <select className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] focus:outline-none focus:border-[#32B8BF]">
                    <option value="operator">Emergency Operator</option>
                    <option value="traffic_police">Traffic Police Control</option>
                    <option value="hospital_admin">Hospital ED Triage</option>
                    <option value="system_admin">System Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#858F99] font-semibold block mb-1">Official Badge ID</label>
                  <input
                    type="text"
                    required
                    placeholder="BTP-2026-904"
                    className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] focus:outline-none focus:border-[#32B8BF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#858F99] font-semibold block mb-1">Government Email</label>
                <input
                  type="email"
                  required
                  placeholder="officer@karnataka.gov.in"
                  className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] focus:outline-none focus:border-[#32B8BF]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#32B8BF] hover:bg-[#28A66A] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm mt-2"
              >
                Submit Authorization Request
              </button>
            </form>
          )}

          {/* TAB 4: Forgot */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5 text-xs">
              <p className="text-[#858F99] text-xs leading-normal">
                Enter your registered Department email to receive a hardware token synchronization code.
              </p>
              <div>
                <label className="text-[#858F99] font-semibold block mb-1">Government Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="officer@karnataka.gov.in"
                  className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] focus:outline-none focus:border-[#32B8BF]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#16A4E8] hover:bg-[#0A699F] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Send Reset Code
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
