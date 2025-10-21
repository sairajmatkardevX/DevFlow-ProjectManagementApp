"use client";

import Header from "@/components/Header";
import ProjectCard from "@/components/ProjectCard";
import TaskCard from "@/components/TaskCard";
import UserCard from "@/components/UserCard";
import { useSearchQuery } from "@/state/api";
import { debounce } from "lodash-es";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchIcon, AlertCircle } from "lucide-react";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: searchResults,
    isLoading,
    isError,
    refetch,
  } = useSearchQuery(searchTerm, {
    skip: searchTerm.length < 3,
  });

  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    500,
  );

  useEffect(() => {
    return handleSearch.cancel;
  }, [handleSearch.cancel]);

  const hasResults = searchResults && (
    (searchResults.tasks && searchResults.tasks.length > 0) ||
    (searchResults.projects && searchResults.projects.length > 0) ||
    (searchResults.users && searchResults.users.length > 0)
  );

  return (
    <div className="p-6">
      <Header name="Search" />
      
      {/* Search Input */}
      <div className="mb-6">
        <div className="relative w-full max-w-2xl">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks, projects, users..."
            className="pl-10 pr-4 py-6 text-lg"
            onChange={handleSearch}
          />
        </div>
        {searchTerm.length > 0 && searchTerm.length < 3 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Type at least 3 characters to search...
          </p>
        )}
      </div>

      {/* Results */}
      <div className="space-y-6">
        {isLoading && <SearchSkeleton />}
        
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error occurred while fetching search results.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !isError && searchTerm.length >= 3 && !hasResults && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No results found for {searchTerm}
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !isError && hasResults && (
          <div className="space-y-8">
            {/* Tasks Section */}
            {searchResults.tasks && searchResults.tasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Tasks</span>
                    <span className="text-sm text-muted-foreground">
                      ({searchResults.tasks.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {searchResults.tasks.map((task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onTaskUpdated={refetch}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Projects Section */}
            {searchResults.projects && searchResults.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Projects</span>
                    <span className="text-sm text-muted-foreground">
                      ({searchResults.projects.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  {searchResults.projects.map((project) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      onProjectDeleted={refetch}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Users Section */}
            {searchResults.users && searchResults.users.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>Users</span>
                    <span className="text-sm text-muted-foreground">
                      ({searchResults.users.length})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.users.map((user) => (
                    <UserCard key={user.userId} user={user} />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Skeleton loader
const SearchSkeleton = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </CardContent>
    </Card>
  </div>
);

export default Search;