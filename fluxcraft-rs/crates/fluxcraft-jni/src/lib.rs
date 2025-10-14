use fluxcraft_pipeline::pipeline::Pipeline;
use jni::JNIEnv;

use jni::objects::{JObject, JString};

use jni::sys::{jbyteArray, jclass, jlong, jobject};
use tokio::runtime::Runtime;

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_fluxcraft_lib_core_Pipeline_load(
    mut env: JNIEnv,
    _class: jclass,
    path: JString,
) -> jobject {
    let file_path: String = env.get_string(&path).unwrap().into();

    match Pipeline::load(&file_path) {
        Ok(pipeline) => {
            let boxed = Box::new(pipeline);
            // FIXME this is never freed
            let ptr = Box::into_raw(boxed) as jlong;

            let cls = env.find_class("org/fluxcraft/lib/core/Pipeline").unwrap();
            let obj = env.new_object(cls, "(J)V", &[ptr.into()]).unwrap();

            obj.into_raw()
        }
        Err(_) => std::ptr::null_mut(),
    }
}

#[unsafe(no_mangle)]
pub extern "system" fn Java_org_fluxcraft_lib_core_Pipeline_execute<'local>(
    mut env: JNIEnv<'local>,
    jthis: JObject<'local>,
) -> jbyteArray {
    // FIXME error handling
    let native_handle = env
        .get_field(&jthis, "nativeHandle", "J")
        .unwrap()
        .j()
        .unwrap();

    let pipeline = unsafe { &mut *(native_handle as *mut Pipeline) };

    // FIXME error handling
    let rt = Runtime::new().unwrap();

    return match rt.block_on(pipeline.execute()) {
        Ok(data) => {
            if let Ok(arr) = env.byte_array_from_slice(&data) {
                arr.into_raw()
            } else {
                let _ = env.throw_new("java/lang/RuntimeException", format!("{}", "failed"));
                std::ptr::null_mut()
            }
        }
        Err(e) => {
            let _ = env.throw_new("java/lang/RuntimeException", format!("{}", e));
            std::ptr::null_mut()
        }
    };
}
