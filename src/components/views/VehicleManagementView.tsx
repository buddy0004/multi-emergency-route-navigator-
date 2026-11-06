import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Wifi,
  Radio,
  ShieldCheck,
  Edit3,
  Power,
  X,
  Battery,
  MapPin,
} from 'lucide-react';
import { useEmergenx } from '../../context/EmergenxContext';
import { EmergencyVehicle, VehicleCategory } from '../../types';

export const VehicleManagementView: React.FC = () => {
  const { vehicles, registerVehicle, updateVehicle } = useEmergenx();
  const [categoryFilter, setCategoryFilter] = useState<VehicleCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // New vehicle form state
  const [newReg, setNewReg] = useState('KA-01-EA-1006');
  const [newCallSign, setNewCallSign] = useState('MEDIC-106 (Apollo Rapid)');
  const [newCategory, setNewCategory] = useState<VehicleCategory>('ambulance');
  const [newService, setNewService] = useState('Apollo Hospitals Emergency Fleet');
  const [newDriver, setNewDriver] = useState('Harish Gowda');
  const [newPhone, setNewPhone] = useState('+91 98450 77112');

  const filteredVehicles = vehicles.filter((v) => {
    if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.callSign.toLowerCase().includes(q) ||
        v.registrationNumber.toLowerCase().includes(q) ||
        v.assignedService.toLowerCase().includes(q) ||
        v.driverName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerVehicle({
      registrationNumber: newReg,
      callSign: newCallSign,
      category: newCategory,
      assignedService: newService,
      driverName: newDriver,
      driverPhone: newPhone,
      currentLocation: { lat: 12.9716, lng: 77.5946 },
      locationName: 'Central Bangalore Hub Base',
      status: 'idle',
      gpsStatus: 'live',
      connectivity: 'normal',
      verificationStatus: 'verified',
      currentSpeedKmh: 0,
      batteryOrFuelPercent: 100,
    });
    setIsRegisterOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#EBFBF7] flex items-center justify-center text-[#32B8BF]">
              <Truck className="w-4 h-4 text-[#32B8BF]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#292D32]">
              Emergency Vehicle Fleet Management
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF5FB] text-[#0A699F] border border-[#91C4FC] font-bold uppercase">
              {vehicles.length} Registered Units
            </span>
          </div>
          <p className="text-xs text-[#858F99]">
            Registered vehicle inventory, transponder telemetry verification, driver assignments, and availability state.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#32B8BF] hover:bg-[#28A66A] rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register Vehicle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-[#E6EAEE] shadow-2xs">
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-[#858F99] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search registration, driver, service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32] placeholder-[#858F99] focus:outline-none focus:border-[#32B8BF]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {(
            [
              { id: 'all', label: 'All Fleet' },
              { id: 'ambulance', label: 'Ambulances' },
              { id: 'fire_engine', label: 'Fire Tenders' },
              { id: 'police', label: 'Police Patrols' },
              { id: 'disaster_rescue', label: 'Disaster Rescue' },
              { id: 'blood_transport', label: 'Blood Cryo' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as VehicleCategory | 'all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-[#32B8BF] text-white font-semibold shadow-2xs'
                  : 'bg-[#F5F7F9] text-[#858F99] hover:text-[#292D32] border border-[#E6EAEE]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVehicles.map((v) => {
          const isEnRoute = v.status === 'en_route' || v.status === 'transporting';
          return (
            <div
              key={v.id}
              className="p-5 rounded-xl bg-white border border-[#E6EAEE] hover:border-[#32B8BF]/50 shadow-2xs transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EBF5FB] text-[#0A699F] border border-[#91C4FC] font-bold uppercase">
                    {v.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                      isEnRoute
                        ? 'bg-[#FEECEC] text-[#FE595B] border border-[#FE595B]/30 animate-pulse'
                        : 'bg-[#EBFBF7] text-[#28A66A] border border-[#28A66A]/30'
                    }`}
                  >
                    {v.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-[#292D32]">{v.callSign}</h3>
                  <p className="text-xs text-[#858F99] font-mono">{v.registrationNumber}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#F5F7F9] p-2.5 rounded-lg border border-[#E6EAEE]">
                  <div>
                    <span className="text-[#858F99] block text-[10px]">Speed</span>
                    <span className="font-bold text-[#292D32]">{v.currentSpeedKmh} km/h</span>
                  </div>
                  <div>
                    <span className="text-[#858F99] block text-[10px]">Fuel / Battery</span>
                    <span className="font-bold text-[#28A66A]">{v.batteryOrFuelPercent}%</span>
                  </div>
                </div>

                <div className="text-xs text-[#858F99] space-y-1">
                  <div>
                    <span className="text-[#858F99]">Service:</span>{' '}
                    <span className="text-[#292D32]">{v.assignedService}</span>
                  </div>
                  <div>
                    <span className="text-[#858F99]">Driver:</span>{' '}
                    <strong className="text-[#292D32]">{v.driverName}</strong> ({v.driverPhone})
                  </div>
                  <div>
                    <span className="text-[#858F99]">Location:</span>{' '}
                    <span className="text-[#292D32]">{v.locationName}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6EAEE] flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#28A66A] flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Transponder Verified</span>
                </span>

                <button
                  onClick={() =>
                    updateVehicle(v.id, {
                      status: v.status === 'idle' ? 'en_route' : 'idle',
                      currentSpeedKmh: v.status === 'idle' ? 48 : 0,
                    })
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    v.status === 'idle'
                      ? 'bg-[#EBF5FB] hover:bg-[#d8ecf8] text-[#0A699F] border border-[#91C4FC]'
                      : 'bg-[#F5F7F9] hover:bg-[#E6EAEE] text-[#858F99]'
                  }`}
                >
                  {v.status === 'idle' ? 'Toggle Transit' : 'Set Idle'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#E6EAEE] shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E6EAEE] pb-3">
              <h3 className="text-base font-bold text-[#292D32]">Register Emergency Vehicle</h3>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-[#858F99] hover:text-[#292D32]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="text-[#858F99] block mb-1">Registration Number</label>
                <input
                  type="text"
                  required
                  value={newReg}
                  onChange={(e) => setNewReg(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32]"
                />
              </div>

              <div>
                <label className="text-[#858F99] block mb-1">Call Sign</label>
                <input
                  type="text"
                  required
                  value={newCallSign}
                  onChange={(e) => setNewCallSign(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32]"
                />
              </div>

              <div>
                <label className="text-[#858F99] block mb-1">Vehicle Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as VehicleCategory)}
                  className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32]"
                >
                  <option value="ambulance">Ambulance (ALS/BLS)</option>
                  <option value="fire_engine">Fire Tender / Heavy Platform</option>
                  <option value="police">Police Patrol / Interceptor</option>
                  <option value="blood_transport">Blood / Organ Cryo-Transport</option>
                  <option value="disaster_rescue">Disaster & Urban Search Rescue</option>
                </select>
              </div>

              <div>
                <label className="text-[#858F99] block mb-1">Assigned Department / Service</label>
                <input
                  type="text"
                  required
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#858F99] block mb-1">Assigned Driver Name</label>
                  <input
                    type="text"
                    required
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32]"
                  />
                </div>
                <div>
                  <label className="text-[#858F99] block mb-1">Driver Contact</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F7F9] border border-[#E6EAEE] rounded-lg text-[#292D32]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6EAEE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 bg-[#F5F7F9] text-[#858F99] hover:text-[#292D32] rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#32B8BF] hover:bg-[#28A66A] text-white rounded-lg font-bold"
                >
                  Register Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
