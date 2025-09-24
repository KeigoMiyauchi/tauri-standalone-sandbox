use serde::{Deserialize, Serialize};
use sysinfo::{System, Disks};

#[derive(Serialize, Deserialize, Clone)]
pub struct SystemInfo {
    pub os_name: String,
    pub os_version: String,
    pub kernel_version: String,
    pub hostname: String,
    pub cpu_brand: String,
    pub cpu_cores: usize,
    pub total_memory: u64,
    pub used_memory: u64,
    pub available_memory: u64,
    pub memory_usage_percent: f32,
    pub uptime: u64,
    pub disks: Vec<DiskInfo>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_space: u64,
    pub available_space: u64,
    pub used_space: u64,
    pub usage_percent: f32,
    pub file_system: String,
}

/// システム情報取得を担当するサービスクラス
pub struct SystemService;

impl SystemService {
    /// 新しいSystemServiceインスタンスを作成
    pub fn new() -> Self {
        Self
    }

    /// システム情報を取得
    pub fn get_system_info() -> Result<SystemInfo, String> {
        let mut sys = System::new_all();
        sys.refresh_all();

        // CPU情報
        let cpu_brand = sys.global_cpu_info().brand().to_string();
        let cpu_cores = sys.cpus().len();

        // メモリ情報
        let total_memory = sys.total_memory();
        let used_memory = sys.used_memory();
        let available_memory = sys.available_memory();
        let memory_usage_percent = if total_memory > 0 {
            (used_memory as f32 / total_memory as f32) * 100.0
        } else {
            0.0
        };

        // ディスク情報
        let disks_obj = Disks::new_with_refreshed_list();
        let disks: Vec<DiskInfo> = disks_obj.iter().map(|disk| {
            let total_space = disk.total_space();
            let available_space = disk.available_space();
            let used_space = total_space - available_space;
            let usage_percent = if total_space > 0 {
                (used_space as f32 / total_space as f32) * 100.0
            } else {
                0.0
            };

            DiskInfo {
                name: disk.name().to_string_lossy().to_string(),
                mount_point: disk.mount_point().to_string_lossy().to_string(),
                total_space,
                available_space,
                used_space,
                usage_percent,
                file_system: disk.file_system().to_string_lossy().to_string(),
            }
        }).collect();

        Ok(SystemInfo {
            os_name: System::name().unwrap_or_else(|| "Unknown".to_string()),
            os_version: System::os_version().unwrap_or_else(|| "Unknown".to_string()),
            kernel_version: System::kernel_version().unwrap_or_else(|| "Unknown".to_string()),
            hostname: System::host_name().unwrap_or_else(|| "Unknown".to_string()),
            cpu_brand,
            cpu_cores,
            total_memory,
            used_memory,
            available_memory,
            memory_usage_percent,
            uptime: System::uptime(),
            disks,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_system_info() {
        let result = SystemService::get_system_info();
        assert!(result.is_ok());
        
        let system_info = result.unwrap();
        assert!(!system_info.os_name.is_empty());
        assert!(system_info.cpu_cores > 0);
        assert!(system_info.total_memory > 0);
    }
}