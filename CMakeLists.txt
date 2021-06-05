cmake_minimum_required(VERSION 3.1)
project(squery)

# specify the C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

set(CMAKE_CXX_FLAGS ${CMAKE_CXX_FLAGS} "-pthread")

find_package(OpenSSL REQUIRED)

# add gflags dependency
add_subdirectory(gflags)


# add cpp-httplib dependency
include_directories("${CMAKE_CURRENT_SOURCE_DIR}/cpp-httplib")


# add sqlite3 dependency
#include_directories("${CMAKE_CURRENT_SOURCE_DIR}/sqlite3")
#link_directories("${CMAKE_CURRENT_SOURCE_DIR}/sqlite3")

add_executable(${PROJECT_NAME}  main.cpp)

add_subdirectory(abseil-cpp)

if (OPENSSL_FOUND)
  # Add the include directories for compiling
  target_include_directories(${PROJECT_NAME} PUBLIC ${OPENSSL_INCLUDE_DIR})
  message(STATUS "Found OpenSSL ${OPENSSL_VERSION}")
else()
  message(STATUS "OpenSSL Not Found")
endif()

target_link_libraries(${PROJECT_NAME}  gflags::gflags OpenSSL::SSL OpenSSL::Crypto sqlite3)
